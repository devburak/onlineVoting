const express = require('express');
const memberService = require('../services/memberService');
const {authenticateJWT} = require('../services/authMiddleware')
const router = express.Router();

router.post('/',authenticateJWT, memberService.createMember);
router.get('/',authenticateJWT, memberService.getMembers);
router.get('/nonVoter',authenticateJWT, memberService.nonVoterMembers);
router.get('/:id',authenticateJWT, memberService.getMemberById);
router.put('/:id',authenticateJWT, memberService.updateMember);
router.delete('/:id', authenticateJWT,memberService.deleteMember);

module.exports = router;
