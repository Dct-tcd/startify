import './App.css'
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
 import Navbar from "./components/Navbar";
 import Sidebar from "./components/Sidebar";
 import TestCaseGen from "./pages/TestCaseGen";
 import BugFixer from "./pages/BugFixer";
//  import AutomationWriter from "./pages/AutomationWriter";
 import TestDataGen from "./pages/TestDataGen";
 import CodeMigration from "./pages/CodeMigration";
 import CodeOptimisation from "./pages/CodeOptimisation";
 import CodeReview from "./pages/CodeReview";
 import PromptHistory from "./components/PromptHistory";
 import IntegrationSettings from "./components/IntegrationSettings";
 import HomePage from "./components/HomePage";
 import Layout from "./components/Layout";
 
 export default function App() {
   return (
     <Router>
        <Layout>
       {/* <div className="flex flex-col h-screen"> */}
         <div className="flex flex-1">

         {/* <Navbar /> */}
           <Sidebar />
           <main className="flex-1 p-4 overflow-auto">
             <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/test-case-gen" element={<TestCaseGen />} />
               <Route path="/bug-fixer" element={<BugFixer />} />
               {/* <Route path="/automation-writer" element={<AutomationWriter />} /> */}
               <Route path="/test-data" element={<TestDataGen />} />
               <Route path="/code-migration" element={<CodeMigration />} />
               <Route path="/code-optimisation" element={<CodeOptimisation />} />
               <Route path="/code-review" element={<CodeReview />} />
               <Route path="/prompts" element={<PromptHistory />} />
               <Route path="/settings" element={<IntegrationSettings />} />
             </Routes>
           </main>
         </div>
       {/* </div> */}
       </Layout>
     </Router>
   );
 }

