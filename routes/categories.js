const express = require('express');
const router = express.Router();
const Category = require('../models/categories');
const { check_authentication, check_authorization } = require('../Utils/check_auth');

// Lấy danh sách categories (chỉ lấy categories chưa bị xóa)
router.get('/', async function(req, res, next) {
    try {
        const categories = await Category.find().notDeleted();
        res.status(200).send({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
});

// Lấy danh sách tất cả categories (bao gồm cả đã xóa) - Chỉ admin
router.get('/all', 
    check_authentication, 
    check_authorization(['admin']), 
    async function(req, res, next) {
        try {
            const categories = await Category.find().withDeleted();
            res.status(200).send({
                success: true,
                data: categories
            });
        } catch (error) {
            next(error);
        }
});

// Lấy danh sách categories đã xóa - Chỉ admin
router.get('/deleted', 
    check_authentication, 
    check_authorization(['admin']), 
    async function(req, res, next) {
        try {
            const categories = await Category.find().onlyDeleted();
            res.status(200).send({
                success: true,
                data: categories
            });
        } catch (error) {
            next(error);
        }
});

// Lấy chi tiết một category
router.get('/:id', async function(req, res, next) {
    try {
        const category = await Category.findOne({ _id: req.params.id }).notDeleted();
        if (!category) {
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy danh mục"
            });
        }
        res.status(200).send({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
});

// Tạo category mới
router.post('/', 
    check_authentication, 
    check_authorization(['admin']), 
    async function(req, res, next) {
        try {
            const { categoryName, description } = req.body;
            
            // Kiểm tra tên danh mục đã tồn tại
            const existingCategory = await Category.findOne({ 
                categoryName: categoryName 
            }).withDeleted();
            
            if (existingCategory) {
                return res.status(400).send({
                    success: false,
                    message: "Tên danh mục đã tồn tại"
                });
            }

            const newCategory = new Category({
                categoryName,
                description
            });
            
            await newCategory.save();
            
            res.status(201).send({
                success: true,
                data: newCategory
            });
        } catch (error) {
            next(error);
        }
});

// Cập nhật category
router.put('/:id', 
    check_authentication, 
    check_authorization(['admin']), 
    async function(req, res, next) {
        try {
            const { categoryName, description } = req.body;
            
            // Kiểm tra category tồn tại
            const category = await Category.findOne({ 
                _id: req.params.id 
            }).notDeleted();

            if (!category) {
                return res.status(404).send({
                    success: false,
                    message: "Không tìm thấy danh mục"
                });
            }

            // Nếu đổi tên, kiểm tra tên mới không trùng
            if (categoryName && categoryName !== category.categoryName) {
                const existingCategory = await Category.findOne({
                    categoryName: categoryName,
                    _id: { $ne: req.params.id }
                }).withDeleted();
                
                if (existingCategory) {
                    return res.status(400).send({
                        success: false,
                        message: "Tên danh mục đã tồn tại"
                    });
                }
                category.categoryName = categoryName;
            }

            if (description) {
                category.description = description;
            }

            await category.save();

            res.status(200).send({
                success: true,
                data: category
            });
        } catch (error) {
            next(error);
        }
});

// Xóa mềm category
router.delete('/:id', 
    check_authentication, 
    check_authorization(['admin']), 
    async function(req, res, next) {
        try {
            const category = await Category.findOne({ 
                _id: req.params.id 
            }).notDeleted();
            
            if (!category) {
                return res.status(404).send({
                    success: false,
                    message: "Không tìm thấy danh mục"
                });
            }

            category.isDeleted = true;
            category.deletedAt = new Date();
            await category.save();

            res.status(200).send({
                success: true,
                message: "Đã xóa danh mục thành công"
            });
        } catch (error) {
            next(error);
        }
});

// Khôi phục category đã xóa
router.post('/:id/restore', 
    check_authentication, 
    check_authorization(['admin']), 
    async function(req, res, next) {
        try {
            const category = await Category.findOne({
                _id: req.params.id,
                isDeleted: true
            });
            
            if (!category) {
                return res.status(404).send({
                    success: false,
                    message: "Không tìm thấy danh mục đã xóa"
                });
            }

            category.isDeleted = false;
            category.deletedAt = null;
            await category.save();

            res.status(200).send({
                success: true,
                message: "Đã khôi phục danh mục thành công",
                data: category
            });
        } catch (error) {
            next(error);
        }
});

module.exports = router;
