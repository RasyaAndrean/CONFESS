// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Firebase Authentication Functions
class FirebaseAuth {
  constructor() {
    this.user = null;
    this.setupAuthStateListener();
  }

  setupAuthStateListener() {
    auth.onAuthStateChanged((user) => {
      this.user = user;
      if (user) {
        console.log('User signed in:', user);
        this.updateUserPresence('online');
        // Load user data and initialize app
        this.loadUserData(user.uid);
      } else {
        console.log('User signed out');
        this.updateUserPresence('offline');
        // Redirect to login or show auth screen
        this.showAuthScreen();
      }
    });
  }

  async registerWithEmail(email, password, username, profilePic = null, bio = '') {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await db.collection('users').doc(user.uid).set({
        userId: user.uid,
        username: username,
        email: email,
        profilePic: profilePic || `https://ui-avatars.com/api/?name=${username}&background=random`,
        bio: bio,
        followers: [],
        following: [],
        blockedUsers: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'online'
      });

      return { success: true, user: user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  async loginWithEmail(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      
      // Check if user document exists, create if not
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        await db.collection('users').doc(user.uid).set({
          userId: user.uid,
          username: user.displayName,
          email: user.email,
          profilePic: user.photoURL,
          bio: 'No bio yet',
          followers: [],
          following: [],
          blockedUsers: [],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
          status: 'online'
        });
      }
      
      return { success: true, user: user };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await this.updateUserPresence('offline');
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUserPresence(status) {
    if (this.user) {
      try {
        await db.collection('users').doc(this.user.uid).update({
          status: status,
          lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        console.error('Presence update error:', error);
      }
    }
  }

  async loadUserData(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  showAuthScreen() {
    // Show authentication screens (to be implemented in main app)
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('userSection').classList.add('hidden');
    document.getElementById('mainContent').classList.add('hidden');
  }
}

// Firestore CRUD Operations
class FirestoreCRUD {
  constructor() {
    this.rateLimitMap = new Map();
  }

  // Users Collection
  async getUser(userId) {
    try {
      const doc = await db.collection('users').doc(userId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async updateUser(userId, userData) {
    try {
      await db.collection('users').doc(userId).update({
        ...userData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  }

  async searchUsers(searchTerm) {
    try {
      const snapshot = await db.collection('users')
        .where('username', '>=', searchTerm)
        .where('username', '<=', searchTerm + '\uf8ff')
        .limit(10)
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  async followUser(followerId, followingId) {
    try {
      const batch = db.batch();
      
      // Add to follower's following list
      const followerRef = db.collection('users').doc(followerId);
      batch.update(followerRef, {
        following: firebase.firestore.FieldValue.arrayUnion(followingId)
      });
      
      // Add to followed user's followers list
      const followingRef = db.collection('users').doc(followingId);
      batch.update(followingRef, {
        followers: firebase.firestore.FieldValue.arrayUnion(followerId)
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error following user:', error);
      return { success: false, error: error.message };
    }
  }

  async unfollowUser(followerId, followingId) {
    try {
      const batch = db.batch();
      
      const followerRef = db.collection('users').doc(followerId);
      batch.update(followerRef, {
        following: firebase.firestore.FieldValue.arrayRemove(followingId)
      });
      
      const followingRef = db.collection('users').doc(followingId);
      batch.update(followingRef, {
        followers: firebase.firestore.FieldValue.arrayRemove(followerId)
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return { success: false, error: error.message };
    }
  }

  async blockUser(userId, blockedUserId) {
    try {
      await db.collection('users').doc(userId).update({
        blockedUsers: firebase.firestore.FieldValue.arrayUnion(blockedUserId)
      });
      return { success: true };
    } catch (error) {
      console.error('Error blocking user:', error);
      return { success: false, error: error.message };
    }
  }

  // Posts Collection
  async checkRateLimit(userId) {
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(userId) || { count: 0, resetTime: now + 3600000 }; // 1 hour limit
    
    if (now > userLimit.resetTime) {
      userLimit.count = 0;
      userLimit.resetTime = now + 3600000;
    }
    
    if (userLimit.count >= 10) { // Max 10 posts per hour
      return { allowed: false, message: 'Rate limit exceeded. Please wait before posting again.' };
    }
    
    userLimit.count++;
    this.rateLimitMap.set(userId, userLimit);
    return { allowed: true };
  }

  async createPost(authorId, content, isAnonymous = false, image = null) {
    try {
      // Check rate limit
      const rateLimit = await this.checkRateLimit(authorId);
      if (!rateLimit.allowed) {
        return { success: false, error: rateLimit.message };
      }

      const postId = 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const postData = {
        postId: postId,
        authorId: authorId,
        content: content,
        isAnonymous: isAnonymous,
        image: image,
        likes: [],
        comments: [],
        reports: 0,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('publicPosts').doc(postId).set(postData);
      
      // Add notification to all users
      await this.createNotification('all', 'post', `${isAnonymous ? 'Anonymous' : 'A user'} posted a new confession`, { postId: postId });
      
      return { success: true, postId: postId };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  }

  async getPosts(sortBy = 'timestamp', limit = 50) {
    try {
      let query = db.collection('publicPosts');
      
      if (sortBy === 'popular') {
        query = query.orderBy('likes.length', 'desc');
      } else {
        query = query.orderBy('timestamp', 'desc');
      }
      
      const snapshot = await query.limit(limit).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  async likePost(postId, userId) {
    try {
      const postRef = db.collection('publicPosts').doc(postId);
      await db.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
          throw new Error('Post not found');
        }
        
        const postData = postDoc.data();
        const likes = postData.likes || [];
        
        if (likes.includes(userId)) {
          // Unlike
          const newLikes = likes.filter(id => id !== userId);
          transaction.update(postRef, { likes: newLikes });
        } else {
          // Like
          transaction.update(postRef, { 
            likes: firebase.firestore.FieldValue.arrayUnion(userId) 
          });
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, error: error.message };
    }
  }

  async addComment(postId, authorId, content) {
    try {
      const commentId = 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const commentData = {
        commentId: commentId,
        postId: postId,
        authorId: authorId,
        content: content,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      const postRef = db.collection('publicPosts').doc(postId);
      await db.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
          throw new Error('Post not found');
        }
        
        transaction.update(postRef, { 
          comments: firebase.firestore.FieldValue.arrayUnion(commentId),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });

      await db.collection('comments').doc(commentId).set(commentData);
      return { success: true, commentId: commentId };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  }

  async getComments(postId) {
    try {
      const postDoc = await db.collection('publicPosts').doc(postId).get();
      if (!postDoc.exists) return [];
      
      const postData = postDoc.data();
      const commentIds = postData.comments || [];
      
      if (commentIds.length === 0) return [];
      
      const commentsSnapshot = await db.collection('comments')
        .where(firebase.firestore.FieldValue.documentId(), 'in', commentIds)
        .orderBy('timestamp', 'asc')
        .get();
      
      return commentsSnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  async reportPost(postId, reporterId, reason = 'Inappropriate content') {
    try {
      const postRef = db.collection('publicPosts').doc(postId);
      await db.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
          throw new Error('Post not found');
        }
        
        const postData = postDoc.data();
        const newReports = (postData.reports || 0) + 1;
        transaction.update(postRef, { reports: newReports });
      });

      // Create report document
      await db.collection('reports').add({
        postId: postId,
        reporterId: reporterId,
        reason: reason,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error reporting post:', error);
      return { success: false, error: error.message };
    }
  }

  // Private Messages
  async sendPrivateMessage(senderId, recipientId, content, image = null) {
    try {
      // Check if recipient has blocked sender
      const recipientDoc = await db.collection('users').doc(recipientId).get();
      if (recipientDoc.exists) {
        const recipientData = recipientDoc.data();
        if (recipientData.blockedUsers && recipientData.blockedUsers.includes(senderId)) {
          return { success: false, error: 'This user has blocked you' };
        }
      }

      const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const messageData = {
        messageId: messageId,
        senderId: senderId,
        recipientId: recipientId,
        content: content,
        image: image,
        isRead: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('privateMessages').doc(messageId).set(messageData);
      
      // Create notification for recipient
      await this.createNotification(recipientId, 'message', 'You received a new message', { messageId: messageId });
      
      return { success: true, messageId: messageId };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  async getPrivateMessages(userId, otherUserId = null) {
    try {
      let query;
      if (otherUserId) {
        query = db.collection('privateMessages')
          .where('recipientId', 'in', [userId, otherUserId])
          .where('senderId', 'in', [userId, otherUserId]);
      } else {
        query = db.collection('privateMessages')
          .where('recipientId', '==', userId);
      }
      
      const snapshot = await query.orderBy('timestamp', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async markMessageAsRead(messageId) {
    try {
      await db.collection('privateMessages').doc(messageId).update({
        isRead: true,
        readAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Notifications
  async createNotification(userId, type, content, metadata = {}) {
    try {
      const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const notificationData = {
        notifId: notifId,
        userId: userId,
        type: type,
        content: content,
        metadata: metadata,
        isRead: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('notifications').doc(notifId).set(notificationData);
      return { success: true, notifId: notifId };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  async getNotifications(userId) {
    try {
      const snapshot = await db.collection('notifications')
        .where('userId', 'in', [userId, 'all'])
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notifId) {
    try {
      await db.collection('notifications').doc(notifId).update({
        isRead: true,
        readAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  async clearAllNotifications(userId) {
    try {
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Bookmarks
  async bookmarkPost(userId, postId) {
    try {
      const bookmarkId = 'bookmark_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await db.collection('bookmarks').doc(bookmarkId).set({
        bookmarkId: bookmarkId,
        userId: userId,
        postId: postId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, bookmarkId: bookmarkId };
    } catch (error) {
      console.error('Error bookmarking post:', error);
      return { success: false, error: error.message };
    }
  }

  async removeBookmark(userId, postId) {
    try {
      const snapshot = await db.collection('bookmarks')
        .where('userId', '==', userId)
        .where('postId', '==', postId)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        await db.collection('bookmarks').doc(snapshot.docs[0].id).delete();
      }
      return { success: true };
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserBookmarks(userId) {
    try {
      const snapshot = await db.collection('bookmarks')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .get();
      
      const bookmarkIds = snapshot.docs.map(doc => doc.data().postId);
      if (bookmarkIds.length === 0) return [];
      
      const postsSnapshot = await db.collection('publicPosts')
        .where(firebase.firestore.FieldValue.documentId(), 'in', bookmarkIds)
        .get();
      
      return postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  }
}

// Firebase Storage Functions
class FirebaseStorage {
  async uploadProfilePicture(file, userId) {
    try {
      const storageRef = storage.ref();
      const imageRef = storageRef.child(`profile_pictures/${userId}/${Date.now()}_${file.name}`);
      
      const snapshot = await imageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadPostImage(file, postId) {
    try {
      const storageRef = storage.ref();
      const imageRef = storageRef.child(`post_images/${postId}/${Date.now()}_${file.name}`);
      
      const snapshot = await imageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Error uploading post image:', error);
      return { success: false, error: error.message };
    }
  }
}

// Real-time Listeners
class RealTimeListeners {
  constructor() {
    this.unsubscribeFunctions = [];
  }

  // Listen for new private messages
  listenForMessages(userId, callback) {
    const unsubscribe = db.collection('privateMessages')
      .where('recipientId', '==', userId)
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const messages = snapshot.docChanges().filter(change => change.type === 'added')
          .map(change => ({ id: change.doc.id, ...change.doc.data() }));
        if (messages.length > 0) {
          callback(messages);
        }
      }, (error) => {
        console.error('Error listening for messages:', error);
      });
    
    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Listen for notifications
  listenForNotifications(userId, callback) {
    const unsubscribe = db.collection('notifications')
      .where('userId', 'in', [userId, 'all'])
      .orderBy('timestamp', 'desc')
      .limit(1)
      .onSnapshot((snapshot) => {
        const notifications = snapshot.docChanges().filter(change => change.type === 'added')
          .map(change => ({ id: change.doc.id, ...change.doc.data() }));
        if (notifications.length > 0) {
          callback(notifications);
        }
      }, (error) => {
        console.error('Error listening for notifications:', error);
      });
    
    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Listen for user presence
  listenForUserPresence(userId, callback) {
    const unsubscribe = db.collection('users')
      .doc(userId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          callback(doc.data().status);
        }
      }, (error) => {
        console.error('Error listening for user presence:', error);
      });
    
    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Listen for new posts (for trending/following)
  listenForNewPosts(callback) {
    const unsubscribe = db.collection('publicPosts')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .onSnapshot((snapshot) => {
        const newPosts = snapshot.docChanges().filter(change => change.type === 'added')
          .map(change => ({ id: change.doc.id, ...change.doc.data() }));
        if (newPosts.length > 0) {
          callback(newPosts);
        }
      }, (error) => {
        console.error('Error listening for new posts:', error);
      });
    
    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Cleanup all listeners
  cleanup() {
    this.unsubscribeFunctions.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.unsubscribeFunctions = [];
  }
}

// Initialize services
const firebaseAuth = new FirebaseAuth();
const firestoreCRUD = new FirestoreCRUD();
const firebaseStorage = new FirebaseStorage();
const realTimeListeners = new RealTimeListeners();