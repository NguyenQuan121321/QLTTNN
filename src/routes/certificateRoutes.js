const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/CertificateController');

// CRUD routes
router.get('/', certificateController.getAllCertificates);
router.get('/:id', certificateController.getCertificateById);
router.post('/', certificateController.createCertificate);
router.put('/:id', certificateController.updateCertificate);
router.delete('/:id', certificateController.deleteCertificate);

module.exports = router;