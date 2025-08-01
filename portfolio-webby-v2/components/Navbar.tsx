"use client";

import Link from "next/link";
import React from "react";

import SearchBar from "@/components/SearchBar";


const Navbar: React.FC = () => {
  return (
    <div className="sticky top-0 navbar z-50 px-4 ">
      <div className="absolute inset-0 glass-fade z-40 pointer-events-none"></div>
      <div className="navbar-start z-50">

        {/* hamburger menu */}
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost md:hidden lg:hidden" role="button">
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
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>

          {/* 📱 Mobile Menu */}
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
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
        <Link href="/" className="btn btn-ghost text-xl">
          MySite
        </Link>
      </div>
      
      <div className="navbar-end z-50">
        
        <div className="w-full max-w-sm mx-10">
          <SearchBar />
        </div>

        {/* 🖥️ Desktop Menu */}
        <div className="hidden md:flex lg:flex">
            <ul className="menu menu-horizontal px-1">
            <li>
                <Link href="/">Item 1</Link>
            </li>
            <li>
                <details>
                <summary>Parent</summary>
                <ul className="p-2 bg-base-100 rounded-box">
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
        {/* 🎯 Action Button */}
        <Link href="/contact" className="btn btn-accent rounded-lg text-black font-bold">
          Contact
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
