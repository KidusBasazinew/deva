"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { destroySession } from "@/app/actions/destroySession";

const baseLinks = [
  { label: "Home", href: "/" },
  { label: "Deposit", href: "/deposit" },
  { label: "Team", href: "/team" },
  { label: "About", href: "/about" },
];

const adminLinks = [
  { label: "Withdrawals", href: "/admin/withdrawals" },
  { label: "Approve", href: "/admin/approve" },
];

const Navbar = () => {
  const currentPath = usePathname();
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, currentUser } = useAuth();
  const [filteredLinks, setFilteredLinks] = useState(baseLinks);

  useEffect(() => {
    if (currentUser?.email === process.env.NEXT_PUBLIC_ADMIN) {
      setFilteredLinks([...baseLinks, ...adminLinks]);
    } else {
      setFilteredLinks(baseLinks);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    const result = await destroySession();
    if (result?.success) {
      setIsAuthenticated(false);
      router.push("/sign-in");
    }
  };

  return (
    <nav className="navbar bg-base-100 shadow-lg fixed top-0 z-50 px-4">
      {/* Mobile Menu */}
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {filteredLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={currentPath === link.href ? "active" : ""}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost">
          <Image
            src="/logo.png"
            width={78}
            height={42}
            alt="Hotel Logo"
            className="hidden md:block"
          />
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          {filteredLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={`${
                  currentPath === link.href ? "active" : ""
                } font-medium`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Auth Section */}
      <div className="navbar-end gap-2">
        {!isAuthenticated ? (
          <>
            <Link href="/sign-in" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-primary">
              Sign Up
            </Link>
          </>
        ) : (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost hover:bg-transparent">
              <div className="flex items-center gap-2">
                <div className="avatar">
                  <div className="w-8 rounded-full bg-neutral-focus text-neutral-content">
                    <span className="text-xs">
                      {currentUser?.name?.charAt(0)}
                    </span>
                  </div>
                </div>
                <span>{currentUser?.name}</span>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
