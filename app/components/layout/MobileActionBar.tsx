"use client";

// Components
import { BaseButton, MobilePreviewSheet, InvoiceLoaderModal } from "@/app/components";

// Contexts
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useTranslationContext } from "@/contexts/TranslationContext";

// Icons
import { Eye, FileInput, FolderUp, Save } from "lucide-react";

/**
 * Sticky bottom bar shown below xl, holding the actions that matter on a
 * phone.
 *
 * Rendered inside the <form> so the submit button drives it natively. It is
 * `fixed`, so its position in the DOM has no bearing on layout.
 */
const MobileActionBar = () => {
    const { invoicePdfLoading, saveAsTemplate } = useInvoiceContext();

    const { _t } = useTranslationContext();

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 xl:hidden">
            <div className="pb-safe flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center gap-3">
                    <InvoiceLoaderModal>
                        <BaseButton
                            variant="outline"
                            className="flex-1 whitespace-nowrap"
                            disabled={invoicePdfLoading}
                        >
                            <FolderUp className="h-4 w-4" />
                            Templates
                        </BaseButton>
                    </InvoiceLoaderModal>

                    <BaseButton
                        variant="outline"
                        className="flex-1 whitespace-nowrap"
                        disabled={invoicePdfLoading}
                        onClick={() => {
                            const name = window.prompt("Enter a Business Name for this Template:");
                            if (name && name.trim()) {
                                saveAsTemplate(name.trim());
                            }
                        }}
                    >
                        <Save className="h-4 w-4" />
                        Save Template
                    </BaseButton>
                </div>
                <div className="flex items-center gap-3">
                    <MobilePreviewSheet>
                        <BaseButton
                            variant="outline"
                            className="flex-1 whitespace-nowrap"
                            size="lg"
                            disabled={invoicePdfLoading}
                        >
                            <Eye className="h-5 w-5" />
                            {_t("actions.preview")}
                        </BaseButton>
                    </MobilePreviewSheet>

                    <BaseButton
                        type="submit"
                        className="flex-1 whitespace-nowrap"
                        size="lg"
                        loading={invoicePdfLoading}
                        loadingText={_t("actions.generatePdfLoading")}
                    >
                        <FileInput className="h-5 w-5" />
                        {_t("actions.generatePdf")}
                    </BaseButton>
                </div>
            </div>
        </div>
    );
};

export default MobileActionBar;
