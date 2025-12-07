document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get('id');

    if (!applicationId) {
        displayError('No application ID provided.');
        return;
    }

    loadApplicationDetails(applicationId);
});

function displayError(message) {
    const container = document.getElementById('application-details-container');
    if (container) {
        container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
}

async function loadApplicationDetails(applicationId) {
    try {
        // Note: We need a new backend endpoint to fetch a single application by its ID.
        // Let's assume it will be GET /api/applications/:id
        const response = await fetch(`http://localhost:3000/api/applications/${applicationId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch application details.');
        }

        const { application } = await response.json();
        renderApplicationDetails(application);

    } catch (error) {
        console.error('Error loading application details:', error);
        displayError(error.message);
    }
}

function renderApplicationDetails(app) {
    const container = document.getElementById('application-details-container');
    if (!container) return;

    const submittedDate = new Date(app.date_submitted).toLocaleString();
    const interviewDate = app.preferred_interview_date 
        ? new Date(app.preferred_interview_date).toLocaleDateString() + ' at ' + app.preferred_interview_time
        : 'Not specified';

    container.innerHTML = `
        <div class="card shadow-sm border-0">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h2 class="fw-bold mb-0">Application for ${app.pet_name}</h2>
                <a href="../adopter-applications.html" class="btn btn-outline-secondary btn-sm">
                    <i class="fa-solid fa-arrow-left me-1"></i> Back to Applications
                </a>
            </div>
            <div class="card-body p-4">
                <div class="row g-4">
                    <div class="col-md-8">
                        <h4 class="border-bottom pb-2 mb-3">Application Information</h4>
                        <dl class="row">
                            <dt class="col-sm-4">Application ID</dt>
                            <dd class="col-sm-8">${app.application_id}</dd>

                            <dt class="col-sm-4">Status</dt>
                            <dd class="col-sm-8"><span class="badge bg-primary">${app.status}</span></dd>

                            <dt class="col-sm-4">Date Submitted</dt>
                            <dd class="col-sm-8">${submittedDate}</dd>

                            <dt class="col-sm-4">Reason for Adopting</dt>
                            <dd class="col-sm-8">${app.message || 'N/A'}</dd>

                            <dt class="col-sm-4">Preferred Interview</dt>
                            <dd class="col-sm-8">${interviewDate}</dd>

                            <dt class="col-sm-4">Additional Details</dt>
                            <dd class="col-sm-8">${app.additional_details || 'None'}</dd>
                        </dl>
                    </div>
                    <div class="col-md-4">
                        <h4 class="border-bottom pb-2 mb-3">Pet Details</h4>
                        <div class="text-center">
                            <img src="${app.pet?.before_image || '/frontend/assets/image/photo/placeholder.jpg'}" class="img-fluid rounded mb-3" alt="${app.pet_name}">
                            <a href="/frontend/pages/adopters/adopter-view-pet.html?id=${app.pet?._id}" class="btn btn-primary w-100">View Pet Profile</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

```

#### 3. Add New Backend Route and Controller Function

The new "View Details" page needs a way to fetch a single application. Let's add that to the backend.

**Update `d:\PROJECT\pet_adoption_platform\backend\src\routes\applicationRoutes.js`**
```diff
--- a/d:\PROJECT\pet_adoption_platform\backend\src\routes\applicationRoutes.js
+++ b/d:\PROJECT\pet_adoption_platform\backend\src\routes\applicationRoutes.js
@@ -7,4 +7,7 @@
 // Route to get all applications for a specific adopter
 router.get('/adopter/:adopterId', applicationController.getAdopterApplications);
 
+// Route to get a single application by its ID
+router.get('/:applicationId', applicationController.getApplicationById);
+
 module.exports = router;

```

**Update `d:\PROJECT\pet_adoption_platform\backend\src\controller\applicationController.js`**
```diff
--- a/d:\PROJECT\pet_adoption_platform\backend\src\controller\applicationController.js
+++ b/d:\PROJECT\pet_adoption_platform\backend\src\controller\applicationController.js
@@ -33,3 +33,21 @@
         res.status(500).json({ message: 'Failed to retrieve applications.', error: error.message });
     }
 };
+
+/**
+ * Retrieves a single application by its ID.
+ */
+exports.getApplicationById = async (req, res) => {
+    try {
+        const { applicationId } = req.params;
+        const application = await applicationRepository.findById(applicationId);
+
+        if (!application) {
+            return res.status(404).json({ message: 'Application not found.' });
+        }
+
+        res.status(200).json({ application });
+    } catch (error) {
+        console.error('Error fetching application by ID:', error);
+        res.status(500).json({ message: 'Failed to retrieve application.', error: error.message });
+    }
+};

```

With these changes, your "My Applications" page will now load correctly, display the pet's image on each card, and allow the user to click "View Details" to see a dedicated page for each submission.

<!--
[PROMPT_SUGGESTION]How can I protect the new backend routes so only authenticated users can access them?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]How can a staff member view and update the status of an application?[/PROMPT_SUGGESTION]
-->