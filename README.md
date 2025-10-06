# 🧠 CodeIt - TestIt (Startify)

A modern, intuitive coding platform that combines a powerful editor with testing capabilities. Built with React, Vite, and Supabase.

![CodeIt-TestIt](insert_screenshot_url_here)

## ✨ Features

- 💻 Monaco Editor integration for a VS Code-like coding experience
- 🎨 Modern UI with Tailwind CSS
- 🌙 Dark mode support
- 🔒 Supabase authentication and database
- ⚡ Lightning-fast development with Vite
- 🎯 Syntax highlighting with react-syntax-highlighter
- 📱 Responsive design for all devices

## 🚀 Tech Stack

- React 19
- Vite
- Supabase
- Monaco Editor
- TailwindCSS
- React Router DOM
- Lucide React Icons
- Prettier

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/startify.git
cd startify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## 🛠️ Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## 📁 Project Structure

```
startify/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── services/      # API and service functions
│   ├── styles/        # CSS and style files
│   ├── App.jsx        # Main app component
│   └── main.jsx       # Entry point
├── public/           # Static assets
└── index.html        # HTML template
```

## 🔧 Configuration

### ESLint
The project uses a modern ESLint configuration with support for:
- React Hooks
- React Refresh
- Modern JavaScript features

### Tailwind CSS
Customized Tailwind configuration with:
- Form plugin support
- Custom color schemes
- Responsive design utilities

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

Made with ❤️ by Dct_tcD
