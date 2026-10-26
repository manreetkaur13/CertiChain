const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("CertiChain Backend is running!");
});

app.listen(PORT, () => {
    console.log(`CertiChain server running at http://localhost:${PORT}`);
});
// ========================================
// CERTICHAIN - FRONTEND FUNCTIONALITY
// ========================================

// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");

        const isOpen = navLinks.classList.contains("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}


// Set today's date automatically
const issueDateInput = document.getElementById("issueDate");

if (issueDateInput && !issueDateInput.value) {
    issueDateInput.value = new Date().toISOString().split("T")[0];
}


// Safely load saved certificates
function getCertificates() {
    try {
        const saved = localStorage.getItem("certichain_certificates");
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Could not load certificates:", error);
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
        .replaceAll("-", "")
        .slice(0, 12)
        .toUpperCase();

    return `CC-${new Date().getFullYear()}-${randomPart}`;
}


// Issue certificate
const issueForm = document.getElementById("issueForm");
const issueMessage = document.getElementById("issueMessage");

if (issueForm) {
    issueForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const recipientName =
            document.getElementById("recipientName").value.trim();

        const recipientEmail =
            document.getElementById("recipientEmail").value.trim();

        const courseName =
            document.getElementById("courseName").value.trim();

        const institutionName =
            document.getElementById("institutionName").value.trim();

        const issueDate =
            document.getElementById("issueDate").value;

        if (
            !recipientName ||
            !recipientEmail ||
            !courseName ||
            !institutionName ||
            !issueDate
        ) {
            issueMessage.textContent = "Please complete every field.";
            issueMessage.style.color = "#ff6472";
            return;
        }

        const certificates = getCertificates();

        const certificate = {
            id: generateCertificateId(),
            recipientName,
            recipientEmail,
            courseName,
            institutionName,
            issueDate,
            createdAt: new Date().toISOString(),
            status: "Issued"
        };

        certificates.push(certificate);

        try {
            saveCertificates(certificates);

            issueMessage.style.color = "#61e6ad";
            issueMessage.innerHTML = `
                <strong>Certificate created successfully!</strong><br>
                Certificate ID:
                <strong>${certificate.id}</strong><br>
                Save this ID to verify the certificate later.
            `;

            issueForm.reset();

            if (issueDateInput) {
                issueDateInput.value =
                    new Date().toISOString().split("T")[0];
            }

            document.getElementById("certificateId").value =
                certificate.id;

        } catch (error) {
            issueMessage.style.color = "#ff6472";
            issueMessage.textContent =
                "Could not save the certificate. Please try again.";
        }
    });
}


// Verify certificate
const verifyForm = document.getElementById("verifyForm");
const verifyResult = document.getElementById("verifyResult");

if (verifyForm) {
    verifyForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const certificateId =
            document.getElementById("certificateId")
                .value.trim().toUpperCase();

        const certificates = getCertificates();

        const certificate = certificates.find(
            item => item.id.toUpperCase() === certificateId
        );

        if (!certificate) {
            verifyResult.style.color = "#ff6472";

            verifyResult.innerHTML = `
                <div class="verification-message">
                    <strong>Certificate not found</strong>
                    <p>
                        No matching record exists in this browser.
                        Check the ID or issue a certificate first.
                    </p>
                </div>
            `;

            return;
        }

        verifyResult.style.color = "#61e6ad";

        verifyResult.innerHTML = `
            <div class="verification-message">
                <strong>✓ Matching certificate record found</strong>
                <p><strong>Certificate ID:</strong> ${escapeHTML(certificate.id)}</p>
                <p><strong>Recipient:</strong> ${escapeHTML(certificate.recipientName)}</p>
                <p><strong>Course:</strong> ${escapeHTML(certificate.courseName)}</p>
                <p><strong>Institution:</strong> ${escapeHTML(certificate.institutionName)}</p>
                <p><strong>Issue date:</strong> ${escapeHTML(certificate.issueDate)}</p>
                <p><strong>Status:</strong> ${escapeHTML(certificate.status)}</p>
                <p class="verification-note">
                    This confirms a matching local record only.
                    It does not establish blockchain verification
                    or independently prove the issuer's identity.
                </p>
            </div>
        `;
    });
}


// Escape user-provided text before displaying it in HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

console.log("CertiChain frontend loaded successfully.");