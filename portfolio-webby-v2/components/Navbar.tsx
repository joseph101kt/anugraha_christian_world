"use client";

import Link from "next/link";
import React from "react";

const Navbar: React.FC = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      {/* 🍔 Mobile Dropdown (Left) */}
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden" role="button">
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

      {/* 🖥️ Desktop Menu */}
      <div className="navbar-center hidden lg:flex">
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
      <div className="navbar-end">
        <Link href="/contact" className="btn btn-primary">
          Contact
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
