export default function LoginForm() {
  return (
    <form className="max-w-sm mx-auto space-y-4">
      <h2 className="text-lg font-bold">Login</h2>
      <input type="email" placeholder="Email" className="border p-2 w-full"/>
      <input type="password" placeholder="Password" className="border p-2 w-full"/>
      <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">Login</button>
    </form>
  );
}
