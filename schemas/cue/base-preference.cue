// Base CUE schema for preference scripts
// Universal Application Automation Standard v2.0

package preferences

import "time"

// PreferenceScript is the root type for all preference configurations
#PreferenceScript: {
	metadata: #Metadata
	autoFill: #AutoFillConfig
	validation: #ValidationConfig
	aiPolicy: #AIPolicy
	security: #SecurityConfig
	fields: [#FieldConfig, ...#FieldConfig]
}

// Metadata about the preference script
#Metadata: {
	name: string
	version: string & =~"^\\d+\\.\\d+\\.\\d+$"  // Semantic versioning
	provider: string
	category: "employment" | "education" | "general" | "custom"
	description: string
	author?: string
	created: time.Time
	updated: time.Time
	compatibilityVersion: "2.0"
}

// Auto-fill configuration
#AutoFillConfig: {
	enabled: bool | *true
	sources: [...#DataSource]
	priority: [...#DataSource]

	allowedFields: {
		personalInfo: bool | *true
		dateOfBirth: bool | *false  // Sensitive, default false
		contactInfo: bool | *true
		employmentHistory: bool | *true
		educationHistory: bool | *true
		skills: bool | *true
		certifications: bool | *true
		references: bool | *true
	}

	disallowedFields: [...string]
	requireManualAttestation: [...string]
}

#DataSource: "linkedin" | "github" | "google" | "microsoft" | "stored" | "manual"

// Field-specific configuration
#FieldConfig: {
	name: string
	path: string  // JSONPath to field
	dataType: #FieldDataType
	required: bool | *false
	optional: bool | *true

	// Validation
	constraints?: #Constraints

	// Auto-fill
	autoFillable: bool | *true
	autoFillSource?: #DataSource

	// AI assistance
	aiAssistance?: #AIAssistanceConfig

	// Security
	encrypted: bool | *false
	pii: bool | *false

	// Display
	label?: string
	helpText?: string
	placeholder?: string
}

#FieldDataType: "string" | "number" | "date" | "boolean" | "email" | "url" | "phone" | "address" | "document" | "richtext"

// Validation constraints
#Constraints: {
	// String constraints
	maxLength?: int & >0
	minLength?: int & >=0
	pattern?: string  // Regex pattern
	enum?: [...string]

	// Number constraints
	min?: number
	max?: number
	multipleOf?: number

	// Date constraints
	minDate?: time.Time
	maxDate?: time.Time
	futureOnly?: bool
	pastOnly?: bool

	// File constraints
	maxFileSize?: int  // Bytes
	allowedFileTypes?: [...string]

	// Text constraints
	wordCountMin?: int
	wordCountMax?: int

	// Custom validation
	customValidation?: string  // CUE expression
}

// Validation configuration
#ValidationConfig: {
	strict: bool | *true
	stopOnFirstError: bool | *false

	// Field validation rules
	rules: [...#ValidationRule]

	// Cross-field validation
	crossFieldRules?: [...#CrossFieldRule]

	// Custom validation functions
	customValidators?: {
		[string]: string  // Name -> CUE expression
	}
}

#ValidationRule: {
	field: string
	rule: string
	message: string
	severity: "error" | "warning"
}

#CrossFieldRule: {
	fields: [...string]
	rule: string
	message: string
}

// AI assistance policy
#AIPolicy: {
	enabled: bool | *true
	provider: "mistral7b" | "claude" | "gpt4" | "gemini" | "local" | "none"

	allowedFeatures: {
		spellCheck: bool | *true
		grammarCheck: bool | *true
		aiWriting: bool | *false
		aiRewriting: bool | *true
		autoComplete: bool | *true
		translation: bool | *true
	}

	requireDisclosure: bool | *true
	allowedTools?: [...string]

	// Field-specific AI settings
	fieldPolicies?: {
		[string]: #FieldAIPolicy
	}
}

#FieldAIPolicy: {
	allowAI: bool
	requireHumanReview: bool | *false
	suggestionsOnly: bool | *false
}

#AIAssistanceConfig: {
	enabled: bool | *true
	mode: "suggest" | "autocomplete" | "generate"
	requireReview: bool | *true
}

// Security configuration
#SecurityConfig: {
	encryption: {
		enabled: bool | *true
		algorithm: "ed448-kyber1024-blake3" | "aes256gcm"
		encryptPII: bool | *true
	}

	verification: {
		required: [...#VerificationType]
		optional: [...#VerificationType]
	}

	attestation: {
		required: [...#AttestationType]
		collectSignature: bool | *false
	}

	privacy: {
		retentionDays: int & >0 | *90
		shareWithThirdParties: bool | *false
		allowTracking: bool | *false
		deleteAfterSubmission: bool | *false
	}
}

#VerificationType: "email" | "phone" | "governmentId" | "professionalRegistration" | "employmentVerification" | "educationVerification" | "referenceCheck" | "backgroundCheck"

#AttestationType: "accuracy" | "backgroundCheck" | "dataProcessing" | "terms" | "eligibility" | "conflictOfInterest" | "custom"

// Example instances
employmentApplication: #PreferenceScript & {
	metadata: {
		name: "Standard Employment Application"
		version: "1.0.0"
		provider: "Universal Application Standard"
		category: "employment"
		description: "Standard preference script for job applications"
		created: "2024-01-15T10:00:00Z"
		updated: "2024-01-15T10:00:00Z"
		compatibilityVersion: "2.0"
	}

	autoFill: {
		enabled: true
		sources: ["linkedin", "stored"]
		priority: ["stored", "linkedin"]
		allowedFields: {
			personalInfo: true
			dateOfBirth: false
			contactInfo: true
			employmentHistory: true
			educationHistory: true
			skills: true
			certifications: true
			references: true
		}
		requireManualAttestation: ["criminalRecordDisclosure", "eligibilityToWork"]
	}

	validation: {
		strict: true
		rules: [
			{
				field: "email"
				rule: "email"
				message: "Must be a valid email address"
				severity: "error"
			},
			{
				field: "personalStatement"
				rule: "wordCountMax"
				message: "Personal statement must not exceed 500 words"
				severity: "error"
			},
		]
	}

	aiPolicy: {
		enabled: true
		provider: "mistral7b"
		allowedFeatures: {
			spellCheck: true
			grammarCheck: true
			aiWriting: false
			aiRewriting: true
			autoComplete: true
		}
		requireDisclosure: true
	}

	security: {
		encryption: {
			enabled: true
			algorithm: "ed448-kyber1024-blake3"
			encryptPII: true
		}
		verification: {
			required: ["email"]
			optional: ["phone", "employmentVerification"]
		}
		attestation: {
			required: ["accuracy", "terms"]
		}
		privacy: {
			retentionDays: 90
			shareWithThirdParties: false
		}
	}

	fields: [
		{
			name: "firstName"
			path: "$.applicant.personalInfo.firstName"
			dataType: "string"
			required: true
			constraints: {
				minLength: 1
				maxLength: 100
			}
			autoFillable: true
			encrypted: false
			pii: true
		},
		{
			name: "personalStatement"
			path: "$.personalStatement.content"
			dataType: "richtext"
			required: true
			constraints: {
				wordCountMin: 100
				wordCountMax: 500
			}
			aiAssistance: {
				enabled: true
				mode: "suggest"
				requireReview: true
			}
		},
	]
}
