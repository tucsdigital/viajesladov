import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WhiteLabelButtonProps {
  className?: string;
  label?: string;
}

export default function WhiteLabelButton({
  className,
  label = "Arma tu Viaje",
}: WhiteLabelButtonProps) {
  return (
    <Button
      asChild
      className={cn(
        "h-10 border border-[#6787AE] bg-[#6787AE] px-4 text-sm font-semibold text-white hover:border-[#5B7BA1] hover:bg-[#5B7BA1]",
        className
      )}
    >
      <a
        href="https://ladov.paquetedinamico.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{label}</span>
        <Image
          src="/iso.png"
          alt=""
          width={16}
          height={16}
          className="ml-2 h-4 w-4 object-contain"
          aria-hidden="true"
        />
      </a>
    </Button>
  );
}
