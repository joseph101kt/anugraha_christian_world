import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/images/logo.svg"  // ✅ use src, not href
      alt="Logo"
      width={60}              // width in pixels
      height={60}             // height in pixels
    />
  );
}
