# 🎓 Solidity Tutor

An interactive educational tool for learning Solidity smart contract development, inspired by Python Tutor's visual debugging approach.

![Solidity Tutor Screenshot](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xvQ6UShrbDIbiDRCAmHiM4Uwltna6V.png)

## ✨ Features

- **📝 Advanced Code Editor** - Monaco Editor with Solidity syntax highlighting
- **🔍 Step-by-Step Execution** - Visual trace of smart contract execution
- **📊 State Visualization** - Real-time view of storage, stack, and gas usage
- **🤖 AI Tutor** - Intelligent assistant for Solidity concepts (powered by Groq)
- **🌐 Multi-Contract Interactions** - Visualize cross-contract calls
- **📈 Execution Flow Diagrams** - Python Tutor-style visual flow
- **🌍 Multi-language Support** - Spanish, English, French, German, Portuguese
- **🌙 Dark/Light Mode** - Comfortable coding in any environment
- **👤 User Progress Tracking** - Save progress and contracts (with Supabase)

## 🚀 Live Demo

Visit the live application: [https://your-app.vercel.app](https://your-app.vercel.app)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Code Editor**: Monaco Editor
- **AI**: Groq API
- **Database**: Supabase
- **Storage**: Vercel Blob
- **Deployment**: Vercel

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/solidity-tutor.git
cd solidity-tutor
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration (Optional)

For full functionality, create a `.env.local` file:

\`\`\`env
# Supabase (for authentication and progress tracking)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Groq AI (for intelligent tutoring)
GROQ_API_KEY=your_groq_api_key

# Vercel Blob (for contract storage)
BLOB_READ_WRITE_TOKEN=your_blob_token
\`\`\`

> **Note**: The app works without these integrations using fallback functionality.

## 📚 How to Use

1. **Write Solidity Code** - Use the advanced Monaco editor or simple text editor
2. **Execute Transactions** - Click "Execute deposit(100)" to run the code
3. **Step Through Execution** - Use playback controls to see each step
4. **Explore Visualizations**:
   - **State Tab**: View storage, stack, and gas usage
   - **Flow Tab**: See execution flow with arrows and connections
   - **Contracts Tab**: Visualize multi-contract interactions
5. **Ask the AI Tutor** - Get help understanding Solidity concepts
6. **Track Progress** - Save your work and monitor learning progress

## 🎯 Educational Goals

This tool helps students understand:
- **Gas Optimization** - See real gas costs for each operation
- **Storage vs Memory** - Visualize data location and costs
- **Function Execution Flow** - Step-by-step code execution
- **Smart Contract Interactions** - Cross-contract calls and dependencies
- **Security Patterns** - require() statements and validation
- **Solidity Best Practices** - Through AI tutor guidance

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Python Tutor](http://pythontutor.com/) by Philip Guo
- Built with [v0](https://v0.dev) by Vercel
- Solidity syntax highlighting powered by Monaco Editor
- AI tutoring powered by Groq

## 📞 Support

If you have questions or need help:
- Open an [Issue](https://github.com/YOUR_USERNAME/solidity-tutor/issues)
- Join our [Discussions](https://github.com/YOUR_USERNAME/solidity-tutor/discussions)

---

**Made with ❤️ for the Solidity learning community**
