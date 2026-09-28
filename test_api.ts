import { POST } from "./app/api/invoice/sync/route";

async function testApi() {
    const data = {
        receiver: {
            name: "Mohammed Mohsin Ahmed",
            phone: "+966575843484",
            email: "mohammedmohsinahmed@gmail.com",
            address: "11-20-215/4-1..."
        },
        details: {
            invoiceNumber: "SNM-PR-000001",
            invoiceDate: "2026-09-04",
            totalAmount: 2600.00,
            currency: "INR",
            items: [
                { name: "REPAIR CHARGES", quantity: 1, total: 2200.00 },
                { name: "SERVICE CHARGES", quantity: 1, total: 300.00 },
                { name: "SAFAR N MANZIL", quantity: 1, total: 100.00 }
            ]
        }
    };

    const req = new Request("http://localhost:3000/api/invoice/sync", {
        method: "POST",
        body: JSON.stringify(data),
    });

    const res = await POST(req);
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Result:", json);
}

testApi();
