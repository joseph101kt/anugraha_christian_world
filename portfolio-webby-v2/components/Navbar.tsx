"use client";

import Link from "next/link";
import React from "react";

import SearchBar from "@/components/SearchBar";


const Navbar: React.FC = () => {
  return (
    <div className="sticky top-0 z-50">
      <div className=" navbar z-50 px-4 ">
        <div className="navbar-start z-50">

          {/* hamburger menu */}
          <div className="dropdown md:hidden lg:hidden">
            <label tabIndex={0} className="btn btn-outline rounded-sm " role="button">
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
                  strokeWidth={3}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>

            {/* 📱 Mobile Menu */}
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content  mt-3 z-[1] p-2 shadow bg-background rounded-box w-52"
            >
              <li>
                <Link href="/">Item 1</Link>
              </li>
              <li>
                <details>
                  <summary>Parent</summary>
                  <ul className="p-2">
                    <li>
                      <Link href="/">Submenu 1</Link>
                    </li>
                    <li>
                      <Link href="/">Submenu 2</Link>
                    </li>
                  </ul>
                </details>
              </li>
              <li>
                <Link href="/">Item 3</Link>
              </li>
            </ul>
          </div>

          {/* 🧠 Site Logo */}
          <Link href="/" className="font-black rounded-sm text-2xl mx-4">
            Anugraha
          </Link>
        </div>
        
        <div className="navbar-end z-50">
          
          <div className="w-full max-w-sm mx-10 hidden sm:flex md:flex lg:flex">
            <SearchBar />
          </div>

          {/* 🖥️ Desktop Menu */}

          {/* 🎯 Action Button */}
          <Link
            href="/contact"
            className="inline-block px-4 py-2 bg-primary font-black rounded-lg shadow"
          >
            Contact
          </Link>
        </div>
      </div>
      <div className="h-18"></div>
      <div className="absolute inset-0 glass-fade z-40 pointer-events-none"></div>

    </div>
  );
};

export default Navbar;
