import { PatientVitals, PatientEncounter } from '../types';

/**
 * Tailored Clinical Vitals Database
 * Supplies realistic, longitudinal vitals with clinical status flags and trends.
 */
export const mockPatientVitalsMap: Record<string, PatientVitals> = {
  // Eleanor Vance - Hypertension, Mitral Valve Prolapse, Occasional Palpitations
  'PAT-1001': {
    bloodPressure: {
      systolic: 128,
      diastolic: 84,
      unit: 'mmHg',
      status: 'Elevated'
    },
    heartRate: {
      bpm: 78,
      unit: 'bpm',
      status: 'Normal',
      rhythm: 'Normal Sinus Rhythm with occasional PACs'
    },
    spO2: {
      percentage: 98,
      unit: '%',
      status: 'Normal',
      delivery: 'Room Air'
    },
    temperature: {
      fahrenheit: 98.4,
      celsius: 36.9,
      unit: '°F',
      status: 'Normal'
    },
    respiratoryRate: {
      breathsPerMin: 16,
      unit: 'breaths/min',
      status: 'Normal'
    },
    bmi: {
      value: 23.4,
      weightLbs: 138,
      weightKg: 62.6,
      heightFt: `5' 5"`,
      heightCm: 165,
      category: 'Normal'
    },
    bloodGlucose: {
      value: 94,
      unit: 'mg/dL',
      fasting: true,
      hba1c: 5.4
    },
    painScale: {
      score: 1,
      scale: '0-10',
      location: 'Substernal flutter / atypical tightness'
    },
    lastRecordedAt: 'Today at 08:45 AM',
    recordedBy: 'Jackie Rivera, BSN, RN (Cardiology Clinic)',
    historicalReadings: [
      { date: '2026-08-10', bp: '136/88', hr: 84, spO2: 97, temp: 98.6, weightLbs: 139 },
      { date: '2026-06-15', bp: '124/82', hr: 72, spO2: 99, temp: 98.2, weightLbs: 137 },
      { date: '2026-03-22', bp: '130/86', hr: 76, spO2: 98, temp: 98.4, weightLbs: 138 }
    ]
  },

  // Liam Gallagher - Type 2 Diabetes, Hyperlipidemia
  'PAT-1002': {
    bloodPressure: {
      systolic: 132,
      diastolic: 86,
      unit: 'mmHg',
      status: 'Stage 1'
    },
    heartRate: {
      bpm: 74,
      unit: 'bpm',
      status: 'Normal',
      rhythm: 'Regular'
    },
    spO2: {
      percentage: 97,
      unit: '%',
      status: 'Normal',
      delivery: 'Room Air'
    },
    temperature: {
      fahrenheit: 98.6,
      celsius: 37.0,
      unit: '°F',
      status: 'Normal'
    },
    respiratoryRate: {
      breathsPerMin: 18,
      unit: 'breaths/min',
      status: 'Normal'
    },
    bmi: {
      value: 28.1,
      weightLbs: 198,
      weightKg: 89.8,
      heightFt: `5' 11"`,
      heightCm: 180,
      category: 'Overweight'
    },
    bloodGlucose: {
      value: 134,
      unit: 'mg/dL',
      fasting: false,
      hba1c: 7.2
    },
    painScale: {
      score: 0,
      scale: '0-10'
    },
    lastRecordedAt: 'Yesterday at 02:15 PM',
    recordedBy: 'David Kim, MA (Primary Care)',
    historicalReadings: [
      { date: '2026-07-18', bp: '135/88', hr: 76, spO2: 97, temp: 98.6, weightLbs: 200 },
      { date: '2026-04-12', bp: '138/90', hr: 78, spO2: 98, temp: 98.7, weightLbs: 202 },
      { date: '2026-01-10', bp: '130/84', hr: 72, spO2: 98, temp: 98.5, weightLbs: 196 }
    ]
  },

  // Sophia Montgomery - Eczema, Asthma
  'PAT-1003': {
    bloodPressure: {
      systolic: 114,
      diastolic: 72,
      unit: 'mmHg',
      status: 'Normal'
    },
    heartRate: {
      bpm: 68,
      unit: 'bpm',
      status: 'Normal',
      rhythm: 'Regular'
    },
    spO2: {
      percentage: 99,
      unit: '%',
      status: 'Normal',
      delivery: 'Room Air'
    },
    temperature: {
      fahrenheit: 98.2,
      celsius: 36.8,
      unit: '°F',
      status: 'Normal'
    },
    respiratoryRate: {
      breathsPerMin: 14,
      unit: 'breaths/min',
      status: 'Normal'
    },
    bmi: {
      value: 21.6,
      weightLbs: 126,
      weightKg: 57.2,
      heightFt: `5' 4"`,
      heightCm: 163,
      category: 'Normal'
    },
    bloodGlucose: {
      value: 88,
      unit: 'mg/dL',
      fasting: true,
      hba1c: 5.1
    },
    painScale: {
      score: 2,
      scale: '0-10',
      location: 'Skin itching / bilateral forearm pruritus'
    },
    lastRecordedAt: '3 days ago at 11:20 AM',
    recordedBy: 'Alicia Gomez, RN (Dermatology)',
    historicalReadings: [
      { date: '2026-06-20', bp: '116/74', hr: 70, spO2: 99, temp: 98.1, weightLbs: 125 },
      { date: '2026-03-14', bp: '112/70', hr: 66, spO2: 98, temp: 98.3, weightLbs: 127 }
    ]
  },

  // Carlos Mendoza - Angina Pectoris
  'PAT-1004': {
    bloodPressure: {
      systolic: 138,
      diastolic: 88,
      unit: 'mmHg',
      status: 'Stage 1'
    },
    heartRate: {
      bpm: 82,
      unit: 'bpm',
      status: 'Normal',
      rhythm: 'Sinus rhythm with mild exertional ST changes'
    },
    spO2: {
      percentage: 96,
      unit: '%',
      status: 'Normal',
      delivery: 'Room Air'
    },
    temperature: {
      fahrenheit: 98.7,
      celsius: 37.1,
      unit: '°F',
      status: 'Normal'
    },
    respiratoryRate: {
      breathsPerMin: 18,
      unit: 'breaths/min',
      status: 'Normal'
    },
    bmi: {
      value: 27.4,
      weightLbs: 184,
      weightKg: 83.5,
      heightFt: `5' 9"`,
      heightCm: 175,
      category: 'Overweight'
    },
    bloodGlucose: {
      value: 110,
      unit: 'mg/dL',
      fasting: true,
      hba1c: 5.9
    },
    painScale: {
      score: 2,
      scale: '0-10',
      location: 'Substernal pressure after fast walking'
    },
    lastRecordedAt: 'Aug 24, 2026 at 09:30 AM',
    recordedBy: 'Nurse Kevin Lee, BSN (Cardiology Clinic)',
    historicalReadings: [
      { date: '2026-08-01', bp: '142/92', hr: 88, spO2: 96, temp: 98.8, weightLbs: 186 },
      { date: '2026-05-19', bp: '136/86', hr: 80, spO2: 97, temp: 98.6, weightLbs: 183 }
    ]
  },

  // Benjamin Ross - ACL Tear Post-Op
  'PAT-1008': {
    bloodPressure: {
      systolic: 122,
      diastolic: 78,
      unit: 'mmHg',
      status: 'Normal'
    },
    heartRate: {
      bpm: 64,
      unit: 'bpm',
      status: 'Normal',
      rhythm: 'Athletic regular'
    },
    spO2: {
      percentage: 99,
      unit: '%',
      status: 'Normal',
      delivery: 'Room Air'
    },
    temperature: {
      fahrenheit: 98.3,
      celsius: 36.8,
      unit: '°F',
      status: 'Normal'
    },
    respiratoryRate: {
      breathsPerMin: 14,
      unit: 'breaths/min',
      status: 'Normal'
    },
    bmi: {
      value: 24.8,
      weightLbs: 172,
      weightKg: 78.0,
      heightFt: `5' 10"`,
      heightCm: 178,
      category: 'Normal'
    },
    painScale: {
      score: 3,
      scale: '0-10',
      location: 'Right knee surgical joint line'
    },
    lastRecordedAt: 'Aug 28, 2026 at 01:10 PM',
    recordedBy: 'Megan Taylor, PT, DPT (Orthopedics Rehab)',
    historicalReadings: [
      { date: '2026-07-28', bp: '124/80', hr: 68, spO2: 99, temp: 98.5, weightLbs: 174 },
      { date: '2026-07-14', bp: '126/82', hr: 72, spO2: 98, temp: 98.9, weightLbs: 173 }
    ]
  }
};

/**
 * Deterministic Fallback Generator for any Patient
 */
export const getPatientVitals = (patientId: string): PatientVitals => {
  if (mockPatientVitalsMap[patientId]) {
    return mockPatientVitalsMap[patientId];
  }

  // Generate consistent deterministic vitals based on numeric sum of patient ID
  const hash = patientId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const systolic = 116 + (hash % 20);
  const diastolic = 74 + (hash % 14);
  const hr = 66 + (hash % 18);
  const spO2 = 97 + (hash % 3);
  const temp = +(98.1 + (hash % 8) * 0.1).toFixed(1);
  const rr = 14 + (hash % 5);
  const weight = 135 + (hash % 55);
  const heightCm = 160 + (hash % 25);
  const heightInches = Math.round(heightCm / 2.54);
  const heightFt = `${Math.floor(heightInches / 12)}' ${heightInches % 12}"`;
  const bmiVal = +((weight * 703) / (heightInches * heightInches)).toFixed(1);

  return {
    bloodPressure: {
      systolic,
      diastolic,
      unit: 'mmHg',
      status: systolic > 130 ? 'Stage 1' : systolic > 120 ? 'Elevated' : 'Normal'
    },
    heartRate: {
      bpm: hr,
      unit: 'bpm',
      status: hr > 100 ? 'Tachycardia' : hr < 60 ? 'Bradycardia' : 'Normal',
      rhythm: 'Regular'
    },
    spO2: {
      percentage: spO2,
      unit: '%',
      status: spO2 >= 95 ? 'Normal' : 'Borderline',
      delivery: 'Room Air'
    },
    temperature: {
      fahrenheit: temp,
      celsius: +(((temp - 32) * 5) / 9).toFixed(1),
      unit: '°F',
      status: temp > 100.4 ? 'Fever' : 'Normal'
    },
    respiratoryRate: {
      breathsPerMin: rr,
      unit: 'breaths/min',
      status: 'Normal'
    },
    bmi: {
      value: bmiVal,
      weightLbs: weight,
      weightKg: +(weight * 0.453592).toFixed(1),
      heightFt,
      heightCm,
      category: bmiVal < 18.5 ? 'Underweight' : bmiVal < 25 ? 'Normal' : bmiVal < 30 ? 'Overweight' : 'Obese'
    },
    bloodGlucose: {
      value: 92 + (hash % 25),
      unit: 'mg/dL',
      fasting: true,
      hba1c: +(5.2 + (hash % 10) * 0.1).toFixed(1)
    },
    painScale: {
      score: hash % 3,
      scale: '0-10'
    },
    lastRecordedAt: 'Recorded within last 7 days',
    recordedBy: 'Clinical Triage Team',
    historicalReadings: [
      { date: '2026-07-15', bp: `${systolic - 2}/${diastolic - 2}`, hr: hr - 2, spO2, temp, weightLbs: weight },
      { date: '2026-05-10', bp: `${systolic + 2}/${diastolic + 1}`, hr: hr + 1, spO2, temp, weightLbs: weight + 1 }
    ]
  };
};

/**
 * Longitudinal Clinical Encounters
 */
export const mockPatientEncountersMap: Record<string, PatientEncounter[]> = {
  'PAT-1001': [
    {
      id: 'ENC-2026-0810',
      patientId: 'PAT-1001',
      date: '2026-08-10',
      time: '10:30 AM',
      type: 'Diagnostic Cardiac Imaging & Outpatient Evaluation',
      providerName: 'Dr. Marcus Chen, MD',
      providerSpecialty: 'Cardiovascular Disease',
      department: 'Cardiology & Vascular',
      chiefComplaint: 'Atypical substernal chest discomfort and episodic palpitations',
      clinicalSummary: 'Patient attended for specialized myocardial evaluation following recurrent episodes of exertional palpitation. Cardiac MRI (CPT 75561) performed. Echocardiographic strain pattern stable with mild mitral valve prolapse (anterior leaflet). Recommended maintaining current beta-blocker dosing and following up with ambulatory 14-day Holter monitor.',
      diagnoses: ['I25.10 (Atherosclerotic Heart Disease)', 'I34.1 (Mitral Valve Prolapse)', 'R07.9 (Chest Pain, Unspecified)'],
      treatmentPlan: 'Metoprolol Succinate ER 25mg daily; avoid excessive caffeine; prior auth appeal submitted for MRI study.',
      vitalsSummary: 'BP: 128/84 mmHg, HR: 78 bpm, SpO2: 98%',
      status: 'Completed'
    },
    {
      id: 'ENC-2026-0615',
      patientId: 'PAT-1001',
      date: '2026-06-15',
      time: '09:00 AM',
      type: 'Annual Preventative Medicine Exam',
      providerName: 'Dr. Robert Martinez, MD',
      providerSpecialty: 'Internal Medicine / Primary Care',
      department: 'Primary Care Network',
      chiefComplaint: 'Routine annual wellness exam & medication renewal',
      clinicalSummary: 'Comprehensive adult physical examination completed. Normal breath sounds bilaterally, no peripheral edema. Lipid panel ordered and reviewed. Blood pressure well managed. Advised continuing Mediterranean diet and aerobic exercise 150 min/week.',
      diagnoses: ['Z00.00 (General Adult Medical Exam)', 'I10 (Essential Primary Hypertension)'],
      treatmentPlan: 'Maintain Lisinopril 10mg daily; re-check lipid panel in 6 months.',
      vitalsSummary: 'BP: 124/82 mmHg, HR: 72 bpm, SpO2: 99%',
      status: 'Completed'
    },
    {
      id: 'ENC-2026-0904',
      patientId: 'PAT-1001',
      date: '2026-09-04',
      time: '10:30 AM',
      type: 'Cardiology Specialty Follow-up',
      providerName: 'Dr. Marcus Chen, MD',
      providerSpecialty: 'Cardiovascular Disease',
      department: 'Cardiology & Vascular',
      chiefComplaint: 'Follow-up on Cardiac MRI results & review prior auth denial status',
      clinicalSummary: 'Scheduled consultation to review detailed cardiac MRI findings with Dr. Chen and adjust rhythm management protocol.',
      diagnoses: ['I34.1 (Mitral Valve Prolapse)', 'R00.2 (Palpitations)'],
      treatmentPlan: 'Formal MRI interpretation review and decision regarding 14-day Zio Patch.',
      status: 'Scheduled'
    }
  ],

  'PAT-1002': [
    {
      id: 'ENC-2026-0718',
      patientId: 'PAT-1002',
      date: '2026-07-18',
      time: '02:00 PM',
      type: 'Endocrine & Metabolic Chronic Disease Check',
      providerName: 'Dr. Robert Martinez, MD',
      providerSpecialty: 'Internal Medicine / Primary Care',
      department: 'Primary Care Network',
      chiefComplaint: 'Quarterly diabetic check & fasting lab review',
      clinicalSummary: 'HbA1c returned at 7.2% (improved from 7.6% 6 months ago). Microalbuminuria negative. Monofilament sensory foot exam intact bilaterally with normal pedal pulses. Reinforce carb counting and adherence to evening Metformin.',
      diagnoses: ['E11.9 (Type 2 Diabetes Mellitus)', 'E78.5 (Hyperlipidemia)'],
      treatmentPlan: 'Metformin 1000mg BID with meals; Atorvastatin 20mg at bedtime; scheduled eye dilated exam.',
      vitalsSummary: 'BP: 132/86 mmHg, HR: 74 bpm, Glucose: 134 mg/dL',
      status: 'Completed'
    },
    {
      id: 'ENC-2026-0902',
      patientId: 'PAT-1002',
      date: '2026-09-02',
      time: '09:00 AM',
      type: 'Primary Care Follow-up',
      providerName: 'Dr. Robert Martinez, MD',
      providerSpecialty: 'Internal Medicine',
      department: 'Primary Care Network',
      chiefComplaint: 'Repeat HbA1c lab check & blood pressure review',
      clinicalSummary: 'Upcoming chronic disease evaluation.',
      diagnoses: ['E11.9 (Type 2 Diabetes)'],
      treatmentPlan: 'Review glucose log and adjust pharmacotherapy if HbA1c remains > 7.0%.',
      status: 'Scheduled'
    }
  ],

  'PAT-1004': [
    {
      id: 'ENC-2026-0801',
      patientId: 'PAT-1004',
      date: '2026-08-01',
      time: '11:15 AM',
      type: 'Cardiovascular Diagnostic Stress Testing',
      providerName: 'Dr. Marcus Chen, MD',
      providerSpecialty: 'Cardiovascular Disease',
      department: 'Cardiology & Vascular',
      chiefComplaint: 'Exertional chest tightness during uphill walking',
      clinicalSummary: 'Treadmill stress ECG study performed (CPT 93015). Achieved 8.2 METs. Demonstrated 1mm horizontal ST depressions in leads V4-V6 at peak exercise, rapidly resolving with rest. No arrhythmias.',
      diagnoses: ['I20.9 (Angina Pectoris, Unspecified)', 'I25.10 (CAD)'],
      treatmentPlan: 'Initiated Aspirin 81mg, Atorvastatin 40mg, and sublingual Nitroglycerin PRN. Scheduled coronary CTA.',
      vitalsSummary: 'BP: 138/88 mmHg, Peak Exercise BP: 172/96 mmHg, HR: 82 bpm',
      status: 'Completed'
    }
  ]
};

/**
 * Deterministic Encounter Generator for any Patient
 */
export const getPatientEncounters = (
  patientId: string,
  patientName: string,
  providerName: string,
  departmentName: string,
  conditions: string[]
): PatientEncounter[] => {
  if (mockPatientEncountersMap[patientId]) {
    return mockPatientEncountersMap[patientId];
  }

  // Construct realistic encounter history based on patient data
  return [
    {
      id: `ENC-${patientId}-01`,
      patientId,
      date: '2026-07-24',
      time: '10:00 AM',
      type: 'Outpatient Clinical Consultation',
      providerName: providerName || 'Dr. Robert Martinez, MD',
      providerSpecialty: 'Internal Medicine & Chronic Care',
      department: departmentName || 'Primary Care Network',
      chiefComplaint: `Follow-up evaluation for ${conditions.slice(0, 2).join(' & ') || 'general symptoms'}`,
      clinicalSummary: `Patient presented for routine clinical monitoring. Reviewed current medications, active clinical progress, and symptom control. Examination findings within baseline limits. No acute distress noted.`,
      diagnoses: conditions.length > 0 ? conditions : ['Z00.00 (General Medical Evaluation)'],
      treatmentPlan: 'Continue current medication regimen. Order routine monitoring labs. Return to clinic in 3 months or as needed.',
      vitalsSummary: 'BP: 122/80 mmHg, HR: 72 bpm, SpO2: 98%',
      status: 'Completed'
    },
    {
      id: `ENC-${patientId}-02`,
      patientId,
      date: '2026-05-18',
      time: '02:30 PM',
      type: 'Comprehensive Initial Assessment',
      providerName: providerName || 'Dr. Robert Martinez, MD',
      providerSpecialty: 'Internal Medicine',
      department: departmentName || 'Primary Care Network',
      chiefComplaint: 'Establish care and comprehensive health maintenance',
      clinicalSummary: 'Full longitudinal health assessment and baseline laboratory screening completed. Preventive screening schedules updated in EHR.',
      diagnoses: conditions.length > 0 ? [conditions[0]] : ['Z00.00 (General Medical Exam)'],
      treatmentPlan: 'Complete screening labs. Patient instructed on clinical triage portal and emergency contacts.',
      vitalsSummary: 'BP: 120/78 mmHg, HR: 70 bpm, SpO2: 99%',
      status: 'Completed'
    }
  ];
};
