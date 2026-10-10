// Synthetic patient chart for the Aetna CPB 0743 demo case.
//
// FICTIONAL. No PHI. Invented patient, provider, facility, dates and member id.
// This is the only "patient data" the product touches. It is written to satisfy
// most of the policy's criteria and to leave exactly one unsupported (the active
// in-person physical therapy requirement), which is the refusal the demo turns on.

export const aetna0743Chart = `*** SYNTHETIC RECORD. FICTIONAL PATIENT, NO PHI. SOFTWARE DEMONSTRATION ONLY. ***

Westmere Spine & Orthopedic Institute. Neurosurgery
Clinic Note / Prior-Authorization Narrative
Patient: Jamie P. Harrowgate        DOB: 03/14/1979 (age 47)        MRN: SYNTH-0000-DEMO
Date of service: 09/28/2026         Provider: Elena Fairweather-Mott, MD (Neurosurgery)
Plan: Aetna commercial (member ID SYNTH-DEMO-0743)

CHIEF COMPLAINT
Right-sided low back and leg pain for about four months, now limiting work and daily activity.

HISTORY OF PRESENT ILLNESS
Mr. Harrowgate is a 47-year-old right-handed delivery driver with roughly four months of right
low back pain that radiates down the right buttock and posterolateral thigh, past the knee to the
lateral foot and fourth and fifth toes. The leg pain is worse than the back pain and is aggravated
by sitting, coughing, and forward bending. Onset was gradual after repetitive lifting at work; there
was no acute trauma. Symptoms have been persistent and have not improved with time or self-care.
He denies bowel or bladder incontinence, denies saddle anesthesia, and denies any rapidly
progressive weakness; motor findings have been stable over three serial visits since June 2026.

CONSERVATIVE CARE TO DATE (July to September 2026)
Conservative care over the past 10 weeks (July to September 2026) has included the following.
- Medications: naproxen 500 mg twice daily for eight weeks and acetaminophen 1 g three times
  daily, with only partial relief.
- Patient education: counseled in clinic on activity modification, the expected natural history of
  lumbar radiculopathy, and nonsurgical options, and given written lumbar self-care education
  materials.
- Home program: a self-directed daily stretching, core, and walking routine at home for roughly
  10 weeks.
- Activity modification: light duty requested at work, lumbar support cushion, avoidance of
  prolonged sitting.

PAST MEDICAL HISTORY
Hypertension, well controlled. No diabetes. No prior spine surgery. No coagulopathy.

MEDICATIONS
Lisinopril 10 mg daily. Naproxen 500 mg BID (as above). Acetaminophen 1 g TID (as above).

ALLERGIES
No known drug allergies.

SOCIAL HISTORY
Lives with partner. Works as a delivery driver. Never-smoker. Alcohol rare. No illicit drug use.

REVIEW OF SYSTEMS
Positive for right leg pain, numbness along the lateral foot, and occasional calf cramping.
Negative for fever, weight loss, night pain, incontinence, and saddle numbness.

PHYSICAL EXAM
Gait antalgic favoring the right. Lumbar range of motion reduced with flexion reproducing right
leg pain. Right posterolateral leg pain radiates below the knee to the lateral foot in an S1
distribution, with a positive right straight-leg raise at 35 degrees, an absent right ankle jerk,
and 4/5 weakness of right ankle plantar flexion. Decreased pinprick sensation over the right
lateral foot. Left lower extremity exam normal. No upper motor neuron signs.

IMAGING
MRI lumbar spine dated 09/18/2026: large right paracentral disc extrusion at L5-S1 with
moderate-to-severe right lateral recess narrowing compressing the traversing right S1 nerve root.
Full MRI reviewed: no significant central canal, lateral recess, or foraminal stenosis and no
nerve root compression at L1-2 through L4-5, with all symptomatic findings isolated to the right
L5-S1 level.

FUNCTIONAL STATUS
He can no longer sit longer than 15 minutes, has been unable to work his delivery-driver shifts,
and needs help with dressing and stairs because of the leg pain.

ASSESSMENT
Right L5-S1 herniated disc with a corresponding right S1 radiculopathy, refractory to 10 weeks of
conservative care, with concordant imaging and progressive functional limitation. No red-flag or
urgent findings that would waive a conservative-care trial.

PLAN
Proceed with right L5-S1 laminotomy and microdiscectomy (CPT 63030). Submit for prior
authorization under Aetna CPB 0743.
`;
