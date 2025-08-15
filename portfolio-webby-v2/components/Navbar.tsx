"use client";

import Link from "next/link";
import React from "react";

import SearchBar from "@/components/SearchBar";
import Logo from "./logo";


const Navbar: React.FC = () => {
  return (
    <div className="sticky top-0 z-40 ">
      <div className=" navbar z-40 px-4 ">
        <div className="navbar-start z-50">

          {/* 🧠 Site Logo */}
          <Link href="/" className="font-black rounded-sm text-2xl mx-4 flex items-center">
            <Logo/>
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
            href="/about"
            className="hidden md:inline-block lg:inline-block w-45 px-4 py-2 bg-primary font-black rounded-lg shadow mr-8"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="inline-block px-4 py-2 bg-primary font-black rounded-lg shadow"
          >
            Contact
          </Link>
        </div>
        <div className="absolute inset-0 backdrop-blur-lg pointer-events-none z-30 "></div>
      </div>
    </div>
  );
};

export default Navbar;
