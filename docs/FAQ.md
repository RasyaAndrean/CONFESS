# ❓ Frequently Asked Questions (FAQ)

## 🚀 General Questions

### What is Confess?
Confess is an anonymous messaging platform that allows users to share thoughts publicly or send private anonymous messages to others. It comes in two versions: a local storage edition and a Firebase-powered cloud edition.

### Is Confess free to use?
Yes! Confess is completely free and open-source. Both versions can be used without any cost.

### Do I need technical skills to use Confess?
No! The local storage version requires zero setup - just open the HTML file. The Firebase version requires basic Firebase account setup, but we provide step-by-step guides.

### What are the differences between the two versions?
| Feature | Local Storage | Firebase Edition |
|---------|---------------|------------------|
| Setup | Instant | 15 minutes |
| Data Storage | Browser only | Cloud database |
| Real-time Updates | No | Yes |
| User Authentication | Simple | Professional |
| Scalability | Limited | Unlimited |
| Security | Basic | Advanced |
| Mobile Support | Basic | Full PWA |

## 🔐 Security & Privacy

### Is my data secure?
**Local Storage Version**: Data is stored only in your browser with basic security.
**Firebase Version**: Enterprise-grade security with encryption, authentication, and server-side validation.

### Can anyone see my identity?
The platform is designed for anonymity. Your real identity is not revealed unless you choose to share it. However, always be cautious about information you share.

### How is user privacy protected?
- Anonymous posting options
- End-to-end encryption for private messages (Firebase version)
- No tracking or data collection
- GDPR and CCPA compliant
- User-controlled data deletion

### What security measures are in place?
- Input validation and sanitization
- Rate limiting to prevent abuse
- Content moderation tools
- User blocking functionality
- Secure authentication
- Regular security audits

## 🛠️ Technical Questions

### What browsers are supported?
Confess works on all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Do I need internet connection?
- **Local Version**: No internet required after download
- **Firebase Version**: Requires internet for full functionality

### Can I use Confess on mobile devices?
Yes! Both versions are fully responsive and work great on mobile devices. The Firebase version also supports PWA installation.

### How much storage does it use?
- **Local Version**: ~100KB for the app, data stored in browser
- **Firebase Version**: App ~200KB, data stored in cloud

### Can I run my own instance?
Absolutely! The source code is open-source and you can host your own instance. Check the deployment guides in the documentation.

## 🔧 Setup & Installation

### How do I get started quickly?
1. Download the project files
2. Double-click `index.html`
3. Choose "Local Storage Edition"
4. Start using immediately!

### How do I set up the Firebase version?
1. Create free Firebase account
2. Follow `FIREBASE_MIGRATION_GUIDE.md`
3. Enable required services
4. Deploy security rules
5. Update configuration file

### What if I encounter setup issues?
Check these resources in order:
1. `QUICK_START.md` - Fast troubleshooting
2. `README.md` - Complete documentation
3. GitHub Issues - Community support
4. Email support - support@confess-app.com

### Can I migrate from local to Firebase version?
Yes! The Firebase version includes a built-in migration tool that transfers your existing data seamlessly.

## 🎯 Features & Functionality

### What can I do with Confess?
- Share anonymous public posts
- Send private anonymous messages
- Create and customize user profiles
- Like and comment on posts
- Follow other users
- Bookmark favorite content
- View analytics and statistics
- Participate in trending discussions

### How does the anonymous feature work?
You can choose to post anonymously on public feeds. Your username won't be displayed, but the content will be visible to everyone.

### Can I delete my posts or messages?
Yes, users can delete their own content. In the Firebase version, you can also request complete data deletion.

### How does the reporting system work?
Users can report inappropriate content. Reports are tracked and content with multiple reports may be automatically moderated.

### What are the posting limits?
To prevent spam:
- 10 posts per hour (Firebase version)
- Rate limiting automatically enforced
- Content filtering for inappropriate language

## 📱 Mobile & Offline

### Does Confess work offline?
- **Local Version**: Fully functional offline
- **Firebase Version**: Basic features offline, syncs when online

### Can I install it as an app?
Yes! The Firebase version supports PWA installation on both desktop and mobile devices.

### How do I add it to my home screen?
On mobile browsers:
1. Open the Firebase version
2. Look for "Add to Home Screen" option
3. Follow browser prompts
4. Use like a native app

## 🆘 Troubleshooting

### Common Issues and Solutions

**Issue**: Page doesn't load
**Solution**: Check browser compatibility, clear cache, try different browser

**Issue**: Firebase connection fails
**Solution**: Verify Firebase configuration, check internet connection, ensure services are enabled

**Issue**: Images won't upload
**Solution**: Check file size (max 5MB), file type (images only), internet connection

**Issue**: Login not working
**Solution**: Verify credentials, check for account lockout, reset password if needed

**Issue**: Slow performance
**Solution**: Clear browser data, check internet speed, close other tabs

### Browser Console Errors
Most issues can be diagnosed by checking the browser's developer console (F12). Common errors and solutions:

- **CORS errors**: Configure Firebase authorized domains
- **403/401 errors**: Check Firebase security rules
- **Network errors**: Verify internet connection
- **JavaScript errors**: Clear cache and reload

## 🤝 Community & Support

### How can I contribute?
1. Fork the repository
2. Make your changes
3. Submit a pull request
4. Follow `CONTRIBUTING.md` guidelines

### Where can I get help?
- **Documentation**: Check docs folder
- **GitHub Issues**: Report bugs/features
- **Email**: support@confess-app.com
- **Community**: Discord/Slack channels (if available)

### How do I report bugs?
1. Check existing issues first
2. Use the bug report template
3. Include detailed reproduction steps
4. Add screenshots if helpful
5. Specify browser/environment

### Can I suggest new features?
Yes! We welcome feature suggestions:
1. Check existing feature requests
2. Open new issue with detailed proposal
3. Explain use case and benefits
4. Include implementation ideas if possible

## 🔒 Account & Data Management

### How do I reset my password?
**Firebase Version**: Use "Forgot Password" link on login page
**Local Version**: Contact administrator (no built-in reset)

### Can I download my data?
**Firebase Version**: Built-in data export feature
**Local Version**: Data accessible through browser developer tools

### What happens to my data if I delete my account?
All personal data is permanently deleted. Public posts may remain but will be anonymized.

### How long is data retained?
- Active accounts: Indefinitely (user-controlled)
- Deleted accounts: Immediately purged
- Inactive accounts: 2 years then deleted

## 💰 Commercial & Licensing

### Can I use this for commercial purposes?
Yes! The MIT license allows commercial use. See `LICENSE` file for details.

### Do you offer enterprise support?
Contact enterprise@confess-app.com for commercial licensing and support options.

### Are there any restrictions?
- Must include original license notice
- No warranty provided
- No liability for damages
- Attribution appreciated but not required

## 🌍 Internationalization

### Is Confess available in other languages?
Currently English only, but internationalization support is planned for future versions.

### Can I help translate Confess?
Yes! We welcome translation contributions. Contact translations@confess-app.com

## 📈 Performance & Scaling

### How many users can it handle?
- **Local Version**: Limited by browser storage
- **Firebase Version**: Scales to thousands of concurrent users

### What's the maximum file size?
- Images: 5MB maximum
- Posts: 1000 characters
- Comments: 500 characters

### How often does it auto-save?
- Real-time for Firebase version
- Manual save for local version
- Session data preserved automatically

## 🎯 Advanced Usage

### Can I customize the interface?
Yes! The code is open-source and well-documented. You can:
- Modify colors and themes
- Add custom features
- Change layout and design
- Integrate with other services

### Is there an API available?
Currently no public API, but this is planned for future versions. Contact api@confess-app.com for enterprise API access.

### Can I integrate with other services?
The modular architecture makes integration possible:
- Social media sharing
- Analytics services
- Notification systems
- Third-party authentication

---

## 📞 Still Need Help?

### Quick Support Resources:
1. **Documentation**: `docs/` folder
2. **Quick Start**: `QUICK_START.md`
3. **Email Support**: support@confess-app.com
4. **GitHub Issues**: Bug reports and feature requests
5. **Community**: Check for Discord/Slack links

### Emergency Contact:
For critical security issues: **security@confess-app.com**

---

*Last Updated: February 6, 2026*  
*For the most current information, check the documentation files in the `docs/` folder.*