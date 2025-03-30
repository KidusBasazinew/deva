"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";

// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { MenuIcon } from "lucide-react";
import { destroySession } from "@/app/actions/destroySession";

const baseLinks = [
  { label: "Home", href: "/" },
  { label: "Deposite", href: "/deposite" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Withdrawals", href: "/admin/withdrawals", admin: true },
];

const adminLink = { label: "Approve(admin)", href: "/admin/approve" };

const Navbar = () => {
  const currentPath = usePathname();
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, currentUser } = useAuth();
  const [filteredLinks, setFilteredLinks] = useState(baseLinks);

  useEffect(() => {
    // Update links when user changes
    if (currentUser?.email === "kidusbw@gmail.com") {
      setFilteredLinks([...baseLinks, adminLink]);
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
    <nav
      className="fixed top-0 left-0 right-0 w-full z-50
text-white drop-shadow-xl"
    >
      {/* Desktop Navbar */}
      <div className="hidden lg:flex justify-center gap-x-9 py-4 px-10 bg-white w-fit mx-auto mt-4 rounded-2xl items-center">
        <Link href="/admin/approve">Admin</Link>
        {filteredLinks.map((link: any) => (
          <Link
            key={link.label}
            href={link.href}
            className={`${
              currentPath === link.href ? "text-blue-500" : "text-black"
            } hover:text-blue-500 transition duration-200`}
          >
            {link.label}
          </Link>
        ))}
        <Image src="/hotel_logo.svg" width={78} height={42} alt="Hotel Logo" />

        {!isAuthenticated ? (
          <>
            <Link
              href="/sign-in"
              className={`${
                currentPath === "/sign-in" ? "text-blue-500" : "text-black"
              } hover:text-blue-500 transition duration-200`}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className={`${
                currentPath === "/sign-up" ? "text-blue-500" : "text-black"
              } hover:text-blue-500 transition duration-200`}
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <span className="text-black hover:text-blue-500">
              {currentUser?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-black hover:text-blue-500 transition duration-200"
            >
              Log Out
            </button>
          </>
        )}
      </div>

      {/* Mobile Navbar */}
      {/* <Sheet>
        <SheetTrigger asChild dir="right">
          <div className="flex lg:hidden justify-between py-6 px-10 bg-white items-center mx-5 rounded-2xl mt-4">
            <Image
              src="/hotel_logo.svg"
              width={50}
              height={21}
              alt="Hotel Logo"
            />
            <div className="flex items-center gap-x-4">
              <button aria-label="Open Menu">
                <MenuIcon
                  style={{ width: "30px", height: "30px", color: "black" }}
                />
              </button>
            </div>
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col h-full">
          <div className="flex flex-col space-y-4 mt-6">
            {Links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${
                  currentPath === link.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-400"
                } block p-4 text-lg font-semibold  hover:bg-blue-50 hover:text-blue-600 rounded`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto w-full flex flex-col gap-4 items-center border-t border-gray-300 pt-4">
            {!isAuthenticated ? (
              <div className="w-full flex flex-col items-center gap-4">
                <Link
                  href="/sign-in"
                  className="w-full block px-4 py-5  leading-loose text-white text-xs text-center font-semibold leading-none bg-blue-600 hover:bg-blue-700 rounded-l-xl rounded-t-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="w-full block px-4 py-5 mb-3 leading-loose text-white text-xs text-center font-semibold leading-none bg-blue-600 hover:bg-blue-700 rounded-l-xl rounded-t-xl"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                <p className="!w-full text-center text-lg font-medium">
                  {currentUser?.name}
                </p>
                <button
                  className="text-center w-full block px-4 py-5 leading-loose text-white text-xs  font-semibold leading-none bg-red-600 hover:bg-red-700 rounded-l-xl rounded-t-xl"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet> */}
    </nav>
  );
};

export default Navbar;
