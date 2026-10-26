// ==========================================
// CERTICHAIN - CERTIFICATE GENERATOR
// ==========================================

const { jsPDF } = window.jspdf;

// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
    });
}

// Set today's date automatically
const issueDateInput = document.getElementById("issueDate");

if (issueDateInput && !issueDateInput.value) {
    issueDateInput.value = new Date().toISOString().split("T")[0];
}

// Get saved certificates
function getCertificates() {
    try {
        return JSON.parse(
            localStorage.getItem("certichain_certificates") || "[]"
        );
    } catch (error) {
        return [];
    }
}

// Save certificates
function saveCertificates(certificates) {
    localStorage.setItem(
        "certichain_certificates",
        JSON.stringify(certificates)
    );
}

// Generate a unique certificate ID
function generateCertificateId() {
    const randomPart = crypto.randomUUID()
        .replace(/-/g, "")
        .substring(0, 12)
        .toUpperCase();

    return `CC-${new Date().getFullYear()}-${randomPart}`;
}

// Safely display text in HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

// ==========================================
// CREATE PROFESSIONAL PDF CERTIFICATE
// ==========================================

function downloadCertificate(certificate) {
    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const width = 297;
    const height = 210;

    // Background
    pdf.setFillColor(14, 17, 28);
    pdf.rect(0, 0, width, height, "F");

    // Outer red border
    pdf.setDrawColor(220, 38, 65);
    pdf.setLineWidth(1.5);
    pdf.rect(6, 6, width - 12, height - 12);

    // Inner gold border
    pdf.setDrawColor(205, 170, 100);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, width - 20, height - 20);

    // Top decorative line
    pdf.setFillColor(220, 38, 65);
    pdf.rect(20, 19, width - 40, 1.5, "F");

    // Brand
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(19);
    pdf.text("CERTICHAIN", width / 2, 33, {
        align: "center"
    });

    pdf.setTextColor(220, 38, 65);
    pdf.setFontSize(8);
    pdf.text("DIGITAL CREDENTIAL VERIFICATION", width / 2, 40, {
        align: "center"
    });

    // Certificate heading
    pdf.setTextColor(215, 185, 120);
    pdf.setFontSize(25);
    pdf.text("CERTIFICATE", width / 2, 59, {
        align: "center"
    });

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("OF COMPLETION", width / 2, 67, {
        align: "center"
    });

    // Main content
    pdf.setTextColor(205, 210, 222);
    pdf.setFontSize(11);
    pdf.text("This certificate is proudly presented to", width / 2, 83, {
        align: "center"
    });

    // Student name
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(
        certificate.name.length > 30 ? 19 : 25
    );

    pdf.text(certificate.name, width / 2, 99, {
        align: "center",
        maxWidth: 245
    });

    // Red underline
    pdf.setDrawColor(220, 38, 65);
    pdf.setLineWidth(1);
    pdf.line(100, 105, 197, 105);

    // Course details
    pdf.setTextColor(205, 210, 222);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text("for successfully completing", width / 2, 117, {
        align: "center"
    });

    pdf.setTextColor(225, 185, 100);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(19);

    pdf.text(certificate.course, width / 2, 130, {
        align: "center",
        maxWidth: 245
    });

    // Institution
    pdf.setTextColor(205, 210, 222);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    pdf.text(
        `Issued by: ${certificate.institution}`,
        width / 2,
        143,
        {
            align: "center",
            maxWidth: 245
        }
    );

    // Issue date
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);

    pdf.text(
        `Issue Date: ${certificate.date}`,
        25,
        169
    );

    // Certificate ID
    pdf.setTextColor(225, 185, 100);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);

    pdf.text("CERTIFICATE ID", width - 25, 163, {
        align: "right"
    });

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    pdf.text(certificate.id, width - 25, 170, {
        align: "right"
    });

    // Verification seal
    pdf.setDrawColor(220, 38, 65);
    pdf.setLineWidth(1.2);
    pdf.circle(width / 2, 160, 9);

    pdf.setTextColor(220, 38, 65);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);

    pdf.text("CC", width / 2, 161.5, {
        align: "center"
    });

    // Footer
    pdf.setDrawColor(205, 170, 100);
    pdf.setLineWidth(0.4);
    pdf.line(20, 184, width - 20, 184);

    pdf.setTextColor(190, 195, 205);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    pdf.text(
        "Verify this credential using its Certificate ID on CertiChain.",
        width / 2,
        191,
        {
            align: "center"
        }
    );

    // Download PDF
    const safeName = certificate.name
        .replace(/[^a-z0-9]/gi, "_")
        .substring(0, 40);

    pdf.save(`CertiChain_${safeName}.pdf`);
}

// ==========================================
// ISSUE CERTIFICATE
// ==========================================

const issueForm = document.getElementById("issueForm");
const issueMessage = document.getElementById("issueMessage");

if (issueForm) {
    issueForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("recipientName")
            .value.trim();

        const email = document.getElementById("recipientEmail")
            .value.trim();

        const course = document.getElementById("courseName")
            .value.trim();

        const institution = document.getElementById("institutionName")
            .value.trim();

        const date = document.getElementById("issueDate").value;

        if (!name || !email || !course || !institution || !date) {
            alert("Please fill in all certificate details.");
            return;
        }

        const certificate = {
            id: generateCertificateId(),
            name,
            email,
            course,
            institution,
            date,
            createdAt: new Date().toISOString()
        };

        // Save certificate in this browser
        const certificates = getCertificates();
        certificates.push(certificate);
        saveCertificates(certificates);

        // Show success message
        if (issueMessage) {
            issueMessage.innerHTML = `
                <div style="
                    margin-top:20px;
                    padding:22px;
                    border:1px solid #dc2641;
                    border-radius:14px;
                    background:#151824;
                    color:#ffffff;
                ">
                    <h3 style="color:#f87185;margin-bottom:10px;">
                        🎓 Certificate Generated!
                    </h3>

                    <p>
                        <strong>Student:</strong>
                        ${escapeHTML(certificate.name)}
                    </p>

                    <p>
                        <strong>Course:</strong>
                        ${escapeHTML(certificate.course)}
                    </p>

                    <p style="margin:12px 0;">
                        <strong>Certificate ID:</strong><br>
                        <span style="color:#f0c674;">
                            ${escapeHTML(certificate.id)}
                        </span>
                    </p>

                    <button
                        type="button"
                        id="downloadNewCertificate"
                        style="
                            background:#dc2641;
                            color:white;
                            border:0;
                            padding:12px 20px;
                            border-radius:8px;
                            cursor:pointer;
                            font-weight:bold;
                            margin-top:8px;
                        "
                    >
                        ⬇ Download Certificate PDF
                    </button>
                </div>
            `;

            const downloadButton = document.getElementById(
                "downloadNewCertificate"
            );

            downloadButton.addEventListener("click", function () {
                downloadCertificate(certificate);
            });
        }

        // Fill certificate ID into verification form
        const verifyInput = document.getElementById("certificateId");

        if (verifyInput) {
            verifyInput.value = certificate.id;
        }

        // Download the certificate automatically
        downloadCertificate(certificate);
    });
}

// ==========================================
// VERIFY CERTIFICATE
// ==========================================

const verifyForm = document.getElementById("verifyForm");
const verifyResult = document.getElementById("verifyResult");

if (verifyForm) {
    verifyForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const input = document.getElementById("certificateId");
        const certificateId = input.value.trim();

        const certificate = getCertificates().find(item =>
            item.id.toLowerCase() === certificateId.toLowerCase()
        );

        if (!verifyResult) return;

        if (certificate) {
            verifyResult.innerHTML = `
                <div style="
                    margin-top:20px;
                    padding:20px;
                    border:1px solid #22c55e;
                    border-radius:12px;
                    background:#14231c;
                    color:white;
                ">
                    <h3 style="color:#4ade80;">
                        ✓ Certificate Record Found
                    </h3>

                    <p><strong>Student:</strong>
                        ${escapeHTML(certificate.name)}</p>

                    <p><strong>Course:</strong>
                        ${escapeHTML(certificate.course)}</p>

                    <p><strong>Institution:</strong>
                        ${escapeHTML(certificate.institution)}</p>

                    <p><strong>Issue Date:</strong>
                        ${escapeHTML(certificate.date)}</p>

                    <p><strong>Certificate ID:</strong>
                        ${escapeHTML(certificate.id)}</p>

                    <p style="font-size:12px;margin-top:12px;color:#86efac;">
                        This record exists in this browser's local storage.
                        Blockchain verification has not yet been implemented.
                    </p>
                </div>
            `;
        } else {
            verifyResult.innerHTML = `
                <div style="
                    margin-top:20px;
                    padding:20px;
                    border:1px solid #dc2641;
                    border-radius:12px;
                    background:#25151a;
                    color:white;
                ">
                    <h3 style="color:#fb7185;">
                        ✕ Certificate Record Not Found
                    </h3>

                    <p>
                        No matching certificate was found in this browser.
                        Check the Certificate ID and try again.
                    </p>
                </div>
            `;
        }
    });
}

console.log("CertiChain certificate generator loaded successfully.");
// Connect to CertiChain backend
fetch("http://localhost:5000/api/health")
    .then(response => response.json())
    .then(data => {
        console.log("Backend connected:", data.message);
    })
    .catch(error => {
        console.error("Backend connection failed:", error);
    });
```javascript
// Test connection to the CertiChain backend
fetch("http://localhost:5000/api/health")
    .then(response => response.json())
    .then(data => {
        console.log("Backend connected:", data.message);
    })
    .catch(error => {
        console.error("Backend connection failed:", error);
    });
```

