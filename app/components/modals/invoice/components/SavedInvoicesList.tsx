"use client";

import React from "react";

// RHF
import { useFormContext } from "react-hook-form";

// ShadCn
import { Card, CardContent } from "@/components/ui/card";

// Components
import { BaseButton } from "@/app/components";

// Contexts
import { useInvoiceContext } from "@/contexts/InvoiceContext";

// Helpers
import { formatNumberWithCommas } from "@/lib/helpers";

// Variables
import { DATE_OPTIONS } from "@/lib/variables";

// Types
import { InvoiceType } from "@/types";

type SavedInvoicesListProps = {
    setModalState: React.Dispatch<React.SetStateAction<boolean>>;
};

const SavedInvoicesList = ({ setModalState }: SavedInvoicesListProps) => {
    const { savedInvoices, onFormSubmit, deleteInvoice } = useInvoiceContext();

    const { reset } = useFormContext<InvoiceType>();

    // TODO: Remove "any" from the function below
    // Update fields when selected invoice is changed.
    // ? Reason: The fields don't go through validation when invoice loads
    const updateFields = (selected: any) => {
        // Next 2 lines are so that when invoice loads,
        // the dates won't be in the wrong format
        // ? Selected cannot be of type InvoiceType because of these 2 variables
        selected.details.dueDate = new Date(selected.details.dueDate);
        selected.details.invoiceDate = new Date(selected.details.invoiceDate);

        selected.details.invoiceLogo = "";
        selected.details.signature = {
            data: "",
        };
    };

    /**
     * Transform date values for next submission
     *
     * @param {InvoiceType} selected - The selected invoice
     */
    const transformDates = (selected: InvoiceType) => {
        selected.details.dueDate = new Date(
            selected.details.dueDate
        ).toLocaleDateString("en-US", DATE_OPTIONS);
        selected.details.invoiceDate = new Date(
            selected.details.invoiceDate
        ).toLocaleDateString("en-US", DATE_OPTIONS);
    };

    /**
     * Loads a given invoice into the form.
     *
     * @param {InvoiceType} selectedInvoice - The selected invoice
     */
    const load = (selectedInvoice: InvoiceType) => {
        if (selectedInvoice) {
            updateFields(selectedInvoice);
            reset(selectedInvoice);
            transformDates(selectedInvoice);

            // Close modal
            setModalState(false);
        }
    };


    return (
        <>
            <div className="flex flex-col gap-5 overflow-y-auto max-h-72">
                {savedInvoices.map((invoice, idx) => (
                    <Card
                        key={idx}
                        className="p-2 border rounded-sm hover:border-blue-500 hover:shadow-lg cursor-pointer"
                        // onClick={() => handleSelect(invoice)}
                    >
                        <CardContent className="flex justify-between">
                            <div>
                                <p className="font-semibold text-lg text-primary">
                                    {invoice.details.templateName ? invoice.details.templateName : `Invoice Template #${invoice.details.invoiceNumber}`}
                                </p>
                                <small className="text-gray-500">
                                    Updated at: {invoice.details.updatedAt}
                                </small>
                            </div>

                            <div className="flex flex-col gap-2">
                                <BaseButton
                                    tooltipLabel="Load template into the form"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => load(invoice)}
                                >
                                    Load Template
                                </BaseButton>
                                {/* Remove Invoice Button */}
                                <BaseButton
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteInvoice(idx);
                                    }}
                                >
                                    Delete
                                </BaseButton>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {savedInvoices.length == 0 && (
                    <div>
                        <p>No saved invoices</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default SavedInvoicesList;
