"use client";

import { useTranslationContext } from "@/contexts/TranslationContext";

// Next Intl
import { Link } from "@/i18n/navigation";

// Variables
import { AUTHOR_GITHUB } from "@/lib/variables";

const BaseFooter = () => {
    const { _t } = useTranslationContext();

    return (
        // pb clears the sticky MobileActionBar, which only renders below xl
        <footer className="border-t border-border">
            <div className="container flex flex-col items-center justify-center gap-2 py-6 pb-28 text-sm text-muted-foreground sm:flex-row xl:pb-6">
                <p className="font-medium text-foreground">
                    Powered by <span className="font-bold text-primary">Alif Growth Media</span>
                </p>
            </div>
        </footer>
    );
};

export default BaseFooter;
