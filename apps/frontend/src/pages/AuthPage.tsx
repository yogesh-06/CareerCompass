import { useState } from "react";

import { httpClient, setAccessToken } from "../api/http-client";

export function AuthPage() {
  const [email, setEmail] = useState("candidate@example.com");
  const [password, setPassword] = useState("Password@123");
  const [message, setMessage] = useState("");

  async function register() {
    try {
      await httpClient.post("/auth/register", { email, password });
      setMessage("Registration successful. You can log in now.");
    } catch {
      setMessage("Registration failed. Email may already exist.");
    }
  }

  async function login() {
    try {
      const response = await httpClient.post<{ accessToken: string }>("/auth/login", {
        email,
        password,
      });
      setAccessToken(response.data.accessToken);
      setMessage("Login successful. Token stored in browser local storage.");
    } catch {
      setMessage("Login failed.");
    }
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-semibold text-slate-900">Authentication</h2>
      <p className="mt-1 text-sm text-slate-600">Create account and log in to access plans.</p>
      <div className="mt-4 grid gap-3 md:max-w-md">
        <input
          className="rounded border border-slate-300 p-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
        />
        <input
          className="rounded border border-slate-300 p-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
        />
        <div className="flex gap-2">
          <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={register}>
            Register
          </button>
          <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={login}>
            Login
          </button>
        </div>
        <p className="text-sm text-slate-700">{message}</p>
      </div>
    </section>
  );
}
