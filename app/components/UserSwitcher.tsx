"use client";

import { useEffect, useState } from "react";
import { USER_KEY } from "@/lib/api";

type User = { id: string; name: string };

export default function UserSwitcher() {
  const [users, setUsers] = useState<User[]>([]);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((list: User[]) => {
        setUsers(list);
        const saved = localStorage.getItem(USER_KEY);
        if (!saved || !list.some((u) => u.id === saved)) {
          const first = list[0]?.id ?? "";
          localStorage.setItem(USER_KEY, first);
          window.location.reload();
          return;
        }
        setCurrent(saved);
      });
  }, []);

  function change(id: string) {
    localStorage.setItem(USER_KEY, id);
    window.location.href = "/";
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      Signed in as
      <select
        value={current}
        onChange={(e) => change(e.target.value)}
        className="rounded border bg-white px-2 py-1 text-black"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </label>
  );
}