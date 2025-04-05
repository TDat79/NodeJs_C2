const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { check_authentication, check_authorization } = require('../Utils/check_auth');

// Routes công khai
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Routes yêu cầu quyền admin
router.post('/', 
    check_authentication, 
    check_authorization(['admin']), 
    productController.createProduct
);

router.put('/:id', 
    check_authentication, 
    check_authorization(['admin']), 
    productController.updateProduct
);

router.delete('/:id', 
    check_authentication, 
    check_authorization(['admin']), 
    productController.deleteProduct
);

router.post('/:id/restore', 
    check_authentication, 
    check_authorization(['admin']), 
    productController.restoreProduct
);

router.get('/admin/deleted', 
    check_authentication, 
    check_authorization(['admin']), 
    productController.getDeletedProducts
);

module.exports = router;
