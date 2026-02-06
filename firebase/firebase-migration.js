// Data Migration Script: localStorage to Firestore
// Run this script after setting up Firebase to migrate existing data

class DataMigration {
  constructor() {
    this.migrationStats = {
      users: 0,
      posts: 0,
      messages: 0,
      comments: 0,
      bookmarks: 0,
      notifications: 0
    };
  }

  async migrateAllData() {
    console.log('🚀 Starting data migration from localStorage to Firestore...');
    
    try {
      // Check if user is authenticated
      if (!firebase.auth().currentUser) {
        console.error('❌ User must be logged in to migrate data');
        return { success: false, error: 'User not authenticated' };
      }

      const userId = firebase.auth().currentUser.uid;
      
      // Migrate users data
      await this.migrateUsers(userId);
      
      // Migrate posts data
      await this.migratePosts(userId);
      
      // Migrate messages data
      await this.migrateMessages(userId);
      
      // Migrate comments data
      await this.migrateComments(userId);
      
      // Migrate bookmarks data
      await this.migrateBookmarks(userId);
      
      // Migrate notifications data
      await this.migrateNotifications(userId);
      
      console.log('✅ Data migration completed successfully!');
      console.log('📊 Migration Statistics:', this.migrationStats);
      
      return { success: true, stats: this.migrationStats };
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return { success: false, error: error.message };
    }
  }

  async migrateUsers(currentUserId) {
    console.log('👥 Migrating users data...');
    
    try {
      // Get existing users from localStorage
      const localStorageUsers = JSON.parse(localStorage.getItem('confess_users')) || [];
      
      // Get current user's data
      const currentUser = localStorageUsers.find(u => u.id === currentUserId);
      
      if (!currentUser) {
        console.log('⚠️ Current user not found in localStorage');
        return;
      }
      
      // Create/update current user in Firestore
      const userData = {
        userId: currentUserId,
        username: currentUser.username,
        email: currentUser.email || `${currentUser.username}@confess.local`,
        profilePic: currentUser.profilePic || `https://ui-avatars.com/api/?name=${currentUser.username}`,
        bio: currentUser.bio || 'No bio yet',
        followers: [],
        following: [],
        blockedUsers: [],
        createdAt: currentUser.createdAt ? new Date(currentUser.createdAt) : firebase.firestore.FieldValue.serverTimestamp(),
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'online'
      };
      
      await db.collection('users').doc(currentUserId).set(userData, { merge: true });
      this.migrationStats.users++;
      
      // Migrate other users as minimal profiles
      for (const user of localStorageUsers) {
        if (user.id !== currentUserId) {
          const minimalUserData = {
            userId: user.id,
            username: user.username,
            profilePic: user.profilePic || `https://ui-avatars.com/api/?name=${user.username}`,
            bio: user.bio || 'No bio yet',
            followers: [],
            following: [],
            blockedUsers: [],
            createdAt: user.createdAt ? new Date(user.createdAt) : firebase.firestore.FieldValue.serverTimestamp(),
            status: 'offline'
          };
          
          try {
            await db.collection('users').doc(user.id).set(minimalUserData, { merge: true });
            this.migrationStats.users++;
          } catch (error) {
            console.warn(`⚠️ Failed to migrate user ${user.username}:`, error.message);
          }
        }
      }
      
      console.log(`✅ Migrated ${this.migrationStats.users} users`);
      
    } catch (error) {
      console.error('❌ Error migrating users:', error);
    }
  }

  async migratePosts(currentUserId) {
    console.log('📝 Migrating posts data...');
    
    try {
      const localStoragePosts = JSON.parse(localStorage.getItem('confess_posts')) || [];
      
      for (const post of localStoragePosts) {
        try {
          const postData = {
            postId: post.id,
            authorId: post.authorId,
            content: post.content,
            isAnonymous: post.isAnonymous || false,
            image: post.image || null,
            likes: post.likes ? [post.likes] : [], // Convert number to array
            comments: post.comments ? [post.comments] : [], // Convert number to array
            reports: post.reports || 0,
            timestamp: post.timestamp ? new Date(post.timestamp) : firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          
          await db.collection('publicPosts').doc(post.id).set(postData);
          this.migrationStats.posts++;
          
        } catch (error) {
          console.warn(`⚠️ Failed to migrate post ${post.id}:`, error.message);
        }
      }
      
      console.log(`✅ Migrated ${this.migrationStats.posts} posts`);
      
    } catch (error) {
      console.error('❌ Error migrating posts:', error);
    }
  }

  async migrateMessages(currentUserId) {
    console.log('💬 Migrating messages data...');
    
    try {
      const localStorageMessages = JSON.parse(localStorage.getItem('confess_messages')) || [];
      
      for (const message of localStorageMessages) {
        try {
          // Only migrate messages for current user
          if (message.recipientId === currentUserId || message.senderId === currentUserId) {
            const messageData = {
              messageId: message.id,
              senderId: message.senderId,
              recipientId: message.recipientId,
              content: message.content,
              image: message.image || null,
              isRead: message.isRead || false,
              timestamp: message.timestamp ? new Date(message.timestamp) : firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('privateMessages').doc(message.id).set(messageData);
            this.migrationStats.messages++;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to migrate message ${message.id}:`, error.message);
        }
      }
      
      console.log(`✅ Migrated ${this.migrationStats.messages} messages`);
      
    } catch (error) {
      console.error('❌ Error migrating messages:', error);
    }
  }

  async migrateComments(currentUserId) {
    console.log('💬 Migrating comments data...');
    
    try {
      const localStorageComments = JSON.parse(localStorage.getItem('confess_comments')) || [];
      
      for (const comment of localStorageComments) {
        try {
          const commentData = {
            commentId: comment.id,
            postId: comment.postId,
            authorId: comment.authorId,
            content: comment.content,
            timestamp: comment.timestamp ? new Date(comment.timestamp) : firebase.firestore.FieldValue.serverTimestamp()
          };
          
          await db.collection('comments').doc(comment.id).set(commentData);
          this.migrationStats.comments++;
          
          // Update the post to include this comment ID
          try {
            await db.collection('publicPosts').doc(comment.postId).update({
              comments: firebase.firestore.FieldValue.arrayUnion(comment.id)
            });
          } catch (error) {
            console.warn(`⚠️ Failed to update post ${comment.postId} with comment:`, error.message);
          }
          
        } catch (error) {
          console.warn(`⚠️ Failed to migrate comment ${comment.id}:`, error.message);
        }
      }
      
      console.log(`✅ Migrated ${this.migrationStats.comments} comments`);
      
    } catch (error) {
      console.error('❌ Error migrating comments:', error);
    }
  }

  async migrateBookmarks(currentUserId) {
    console.log('🔖 Migrating bookmarks data...');
    
    try {
      const localStorageBookmarks = JSON.parse(localStorage.getItem('confess_bookmarks')) || [];
      
      for (const bookmark of localStorageBookmarks) {
        try {
          // Only migrate current user's bookmarks
          if (bookmark.userId === currentUserId) {
            const bookmarkData = {
              bookmarkId: bookmark.id,
              userId: bookmark.userId,
              postId: bookmark.postId,
              timestamp: bookmark.timestamp ? new Date(bookmark.timestamp) : firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('bookmarks').doc(bookmark.id).set(bookmarkData);
            this.migrationStats.bookmarks++;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to migrate bookmark ${bookmark.id}:`, error.message);
        }
      }
      
      console.log(`✅ Migrated ${this.migrationStats.bookmarks} bookmarks`);
      
    } catch (error) {
      console.error('❌ Error migrating bookmarks:', error);
    }
  }

  async migrateNotifications(currentUserId) {
    console.log('🔔 Migrating notifications data...');
    
    try {
      const localStorageNotifications = JSON.parse(localStorage.getItem('confess_notifications')) || [];
      
      for (const notification of localStorageNotifications) {
        try {
          // Only migrate current user's notifications
          if (notification.userId === currentUserId || notification.userId === 'all') {
            const notificationData = {
              notifId: notification.id,
              userId: notification.userId,
              type: notification.type || 'info',
              content: notification.message,
              metadata: {},
              isRead: notification.isRead || false,
              timestamp: notification.timestamp ? new Date(notification.timestamp) : firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('notifications').doc(notification.id).set(notificationData);
            this.migrationStats.notifications++;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to migrate notification ${notification.id}:`, error.message);
        }
      }
      
      console.log(`✅ Migrated ${this.migrationStats.notifications} notifications`);
      
    } catch (error) {
      console.error('❌ Error migrating notifications:', error);
    }
  }

  // Backup localStorage data before migration
  backupLocalStorage() {
    console.log('💾 Creating backup of localStorage data...');
    
    const backup = {
      timestamp: new Date().toISOString(),
      users: JSON.parse(localStorage.getItem('confess_users')) || [],
      posts: JSON.parse(localStorage.getItem('confess_posts')) || [],
      messages: JSON.parse(localStorage.getItem('confess_messages')) || [],
      comments: JSON.parse(localStorage.getItem('confess_comments')) || [],
      bookmarks: JSON.parse(localStorage.getItem('confess_bookmarks')) || [],
      notifications: JSON.parse(localStorage.getItem('confess_notifications')) || [],
      following: JSON.parse(localStorage.getItem('confess_following')) || [],
      reports: JSON.parse(localStorage.getItem('confess_reports')) || [],
      settings: JSON.parse(localStorage.getItem('confess_settings')) || {}
    };
    
    // Save backup to localStorage with timestamp
    const backupKey = `confess_backup_${new Date().getTime()}`;
    localStorage.setItem(backupKey, JSON.stringify(backup));
    
    console.log(`✅ Backup created with key: ${backupKey}`);
    return backupKey;
  }

  // Verify migration results
  async verifyMigration(currentUserId) {
    console.log('🔍 Verifying migration results...');
    
    try {
      // Verify user data
      const userDoc = await db.collection('users').doc(currentUserId).get();
      console.log('User data verified:', userDoc.exists);
      
      // Verify posts
      const postsSnapshot = await db.collection('publicPosts')
        .where('authorId', '==', currentUserId)
        .get();
      console.log('User posts verified:', postsSnapshot.size);
      
      // Verify messages
      const messagesSnapshot = await db.collection('privateMessages')
        .where('recipientId', '==', currentUserId)
        .get();
      console.log('User messages verified:', messagesSnapshot.size);
      
      // Verify bookmarks
      const bookmarksSnapshot = await db.collection('bookmarks')
        .where('userId', '==', currentUserId)
        .get();
      console.log('User bookmarks verified:', bookmarksSnapshot.size);
      
      console.log('✅ Migration verification completed');
      return true;
      
    } catch (error) {
      console.error('❌ Migration verification failed:', error);
      return false;
    }
  }

  // Clean up localStorage after successful migration
  cleanupLocalStorage() {
    console.log('🧹 Cleaning up localStorage...');
    
    const keysToRemove = [
      'confess_users',
      'confess_posts', 
      'confess_messages',
      'confess_comments',
      'confess_bookmarks',
      'confess_notifications',
      'confess_following',
      'confess_reports',
      'confess_settings',
      'confess_current_user'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed ${key} from localStorage`);
    });
    
    console.log('✅ localStorage cleanup completed');
  }
}

// Migration execution function
async function runMigration() {
  // Check if Firebase is initialized
  if (!firebase.apps.length) {
    console.error('❌ Firebase not initialized. Please initialize Firebase first.');
    return;
  }
  
  // Check authentication
  if (!firebase.auth().currentUser) {
    console.error('❌ User not authenticated. Please log in first.');
    return;
  }
  
  const migrator = new DataMigration();
  
  // Create backup
  const backupKey = migrator.backupLocalStorage();
  
  // Run migration
  const result = await migrator.migrateAllData();
  
  if (result.success) {
    // Verify migration
    const verified = await migrator.verifyMigration(firebase.auth().currentUser.uid);
    
    if (verified) {
      console.log('🎉 Migration completed successfully!');
      console.log('📊 Final Statistics:', result.stats);
      console.log(`💾 Backup saved with key: ${backupKey}`);
      console.log('🧹 You can now clean up localStorage by calling migrator.cleanupLocalStorage()');
    }
  } else {
    console.error('❌ Migration failed:', result.error);
    console.log(`💾 Your data is backed up with key: ${backupKey}`);
  }
  
  return result;
}

// Make migration tools available globally
window.DataMigration = DataMigration;
window.runMigration = runMigration;