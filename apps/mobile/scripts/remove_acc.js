const fs = require('fs');
const path = 'd:/Hackathons/LokPraman/LokPraman-main/apps/mobile/app/create-task.tsx';
let f = fs.readFileSync(path, 'utf8');

// Replace states
f = f.replace(/const \[acceptanceTime[\s\S]*?useState\(false\);\r?\n/, '');

// Replace handlers
f = f.replace(/const onAccDateChange = [\s\S]*?setAcceptanceTime\(selectedTime\);\r?\n    };\r?\n/, '');

// Replace formData append
f = f.replace(/[ \t]*formData\.append\('acceptanceTime', acceptanceTime\.toISOString\(\)\);\r?\n/, '');

// Replace UI Elements
f = f.replace(/[ \t]*<Text className="text-sm font-semibold text-gray-700 mb-2 mt-4">Acceptance Deadline<\/Text>\r?\n[\s\S]*?<\/View>\r?\n/, '');

// Replace Date/Time picker UI
f = f.replace(/[ \t]*\{showAccDatePicker && \([\s\S]*?onChange=\{onAccTimeChange\}\r?\n[ \t]*\/>\r?\n[ \t]*\)\}\r?\n/, '');

fs.writeFileSync(path, f);
console.log('Update complete');
