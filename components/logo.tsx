import Link from "next/link";
import Image from "next/image";

export function Logo({
  height = "32",
  width = "32",
}: {
  height?: string;
  width?: string;
}) {
  return (
    <Image
      src="/ai_planet_logo.png"
      alt="Logo"
      width={32}
      height={28}
      className="object-contain rounded-full"
    />
  );
}

export function NamedLogoWithLink() {
  return (
    <Link href="/" className="flex flex-row items-center gap-3">
      <Logo height="24" width="24" />
      <h3 className="font-semibold text-lg">PDF_Chat</h3>
    </Link>
  );
}