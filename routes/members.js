const express = require('express');
const memberService = require('../services/memberService');

const router = express.Router();

router.post('/', memberService.createMember);
router.get('/', memberService.getMembers);
router.get('/:id', memberService.getMemberById);
router.put('/:id', memberService.updateMember);
router.delete('/:id', memberService.deleteMember);

module.exports = router;
