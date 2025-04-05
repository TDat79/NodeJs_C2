const Product = require('../models/products');
const Category = require('../models/categories');

const productController = {
    // Lấy danh sách sản phẩm với filter và pagination
    getAllProducts: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                category,
                minPrice,
                maxPrice,
                sort,
                search
            } = req.query;

            let query = Product.find().notDeleted().populate('categoryID');

            // Tìm kiếm theo text
            if (search) {
                query = query.find({ 
                    $or: [
                        { productName: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ] 
                });
            }

            // Filter theo category
            if (category) {
                query = query.where('categoryID', category);
            }

            // Filter theo giá
            if (minPrice || maxPrice) {
                let priceFilter = {};
                if (minPrice) priceFilter.$gte = minPrice;
                if (maxPrice) priceFilter.$lte = maxPrice;
                query = query.where('price', priceFilter);
            }

            // Sắp xếp
            if (sort) {
                const sortOrder = sort.startsWith('-') ? -1 : 1;
                const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
                query = query.sort({ [sortField]: sortOrder });
            } else {
                // Mặc định sắp xếp theo createdAt giảm dần (mới nhất lên đầu)
                query = query.sort({ createdAt: -1 });
            }

            // Pagination
            const skip = (page - 1) * limit;
            const total = await Product.find(query.getQuery()).countDocuments();
            const products = await query.skip(skip).limit(parseInt(limit));

            res.status(200).json({
                success: true,
                data: products,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy chi tiết sản phẩm
    getProductById: async (req, res) => {
        try {
            const product = await Product.findOne({ _id: req.params.id })
                .notDeleted()
                .populate('categoryID');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Tạo sản phẩm mới
    createProduct: async (req, res) => {
        try {
            const {
                productName,
                description,
                price,
                category,
                quantity,
                images,
                discount
            } = req.body;

            // Kiểm tra category tồn tại
            const existingCategory = await Category.findOne({ 
                _id: category
            }).notDeleted();

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Danh mục không tồn tại'
                });
            }

            // Map các trường sang tên mới khi tạo product
            const product = new Product({
                productName: productName,
                description,
                price,
                categoryID: category,
                quantity: quantity,
                images,
                discount,
                status: quantity > 0 ? 'active' : 'outOfStock'
            });

            await product.save();

            // Populate category khi trả về response
            await product.populate('categoryID');

            res.status(201).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Cập nhật sản phẩm
    updateProduct: async (req, res) => {
        try {
            const product = await Product.findOne({ _id: req.params.id }).notDeleted();

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            // Nếu cập nhật category, kiểm tra category mới tồn tại
            if (req.body.categoryID) {
                const existingCategory = await Category.findOne({ 
                    _id: req.body.categoryID 
                }).notDeleted();
                
                if (!existingCategory) {
                    return res.status(404).json({
                        success: false,
                        message: 'Danh mục không tồn tại'
                    });
                }
            }

            // Cập nhật status dựa trên stock
            if (req.body.quantity !== undefined) {
                req.body.status = req.body.quantity > 0 ? 'active' : 'outOfStock';
            }

            Object.assign(product, req.body);
            await product.save();

            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xóa mềm sản phẩm
    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findOne({ _id: req.params.id }).notDeleted();

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            product.isDeleted = true;
            product.deletedAt = new Date();
            await product.save();

            res.status(200).json({
                success: true,
                message: 'Đã xóa sản phẩm thành công'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Khôi phục sản phẩm đã xóa
    restoreProduct: async (req, res) => {
        try {
            const product = await Product.findOne({
                _id: req.params.id,
                isDeleted: true
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm đã xóa'
                });
            }

            product.isDeleted = false;
            product.deletedAt = null;
            await product.save();

            res.status(200).json({
                success: true,
                message: 'Đã khôi phục sản phẩm thành công',
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy danh sách sản phẩm đã xóa (chỉ admin)
    getDeletedProducts: async (req, res) => {
        try {
            const products = await Product.find()
                .onlyDeleted()
                .populate('categoryID');

            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = productController; 