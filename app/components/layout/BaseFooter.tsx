"use client";

import { useTranslationContext } from "@/contexts/TranslationContext";
import Image from "next/image";

// Next Intl
import { Link } from "@/i18n/navigation";

// Variables
import { AUTHOR_GITHUB } from "@/lib/variables";

const BaseFooter = () => {
    const { _t } = useTranslationContext();

    return (
        // pb clears the sticky MobileActionBar, which only renders below xl
        <footer className="border-t border-border">
            <div className="container flex flex-col items-center justify-center gap-4 py-6 pb-28 text-sm text-muted-foreground sm:flex-row xl:pb-6">
                <a 
                    href="https://alif-growth.netlify.app/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                    <span className="font-medium text-foreground">
                        Powered by <span className="font-bold text-primary">Alif Growth Media</span>
                    </span>
                    <Image 
                        src="/alif-logo.png" 
                        alt="Alif Growth Media" 
                        width={32} 
                        height={32} 
                        className="object-contain" 
                    />
                </a>
            </div>
        </footer>
    );
};

export default BaseFooter;
