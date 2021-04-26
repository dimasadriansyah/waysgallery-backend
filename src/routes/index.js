const express = require('express');
const router = express.Router();

const { register, login, loadUser } = require('../controllers/auth');
const {
  getPosts,
  getPost,
  addPost,
  addLike,
  removeLike,
  addComment,
  removeComment,
  getPostsByUser,
  getPostsByFollowing,
} = require('../controllers/posts');
const { putUser, getUsers, loadUserById, uploadArt, followUser, unfollowUser } = require('../controllers/user');
const { addProject } = require('../controllers/project');
const { auth } = require('../middlewares/auth');
const { fileDownload } = require('../middlewares/file');
const { fileUpload } = require('../middlewares/upload');
const { approveHire, rejectHire, createHire, completeHire } = require('../controllers/hire');

// ==================================================================
// Auth
// ==================================================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth', auth, loadUser);

// ==================================================================
// Posts
// ==================================================================
router.get('/posts/:limit/', getPosts);
router.get('/posts/:limit/:userId', getPostsByUser);
router.post('/posts/:limit', auth, getPostsByFollowing);
router.get('/post/:id', getPost);
router.post('/post/', fileUpload('photos', null), auth, addPost);
router.post('/post/like/:id', auth, addLike);
router.delete('/post/like/:id', auth, removeLike);
router.post('/post/comment/:id', auth, addComment);
router.delete('/post/comment/:id', auth, removeComment);

// ==================================================================
// User
// ==================================================================

router.put('/user/profile/', fileUpload('avatar', null), auth, putUser);
router.post('/user/art/', fileUpload('arts', null), auth, uploadArt);
router.get('/users/', getUsers);
router.get('/user/:id', loadUserById);
router.post('/user/follow/:id', auth, followUser);
router.delete('/user/follow/:id', auth, unfollowUser);

// ==================================================================
// Project
// ==================================================================

router.post('/project/:hireId', fileUpload('images', null), auth, addProject);

// ==================================================================
// Hire
// ==================================================================

router.put('/hire/:id', auth, approveHire);
router.delete('/hire/:id', auth, rejectHire);
router.post('/hire', auth, createHire);
router.put('/hire/approve/:id', auth, completeHire);

// ==================================================================
// File
// ==================================================================
router.get('/files/:file', fileDownload);

module.exports = router;
