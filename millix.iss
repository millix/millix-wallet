[Setup]
AppName=Millix
AppVerName=Millix
DefaultDirName={pf64}\Millix
DefaultGroupName=Millix
;Windows 7 is a requirement
MinVersion=0,6.1
AllowNoIcons=yes
OutputDir=.\app\dist\installer\unsigned
OutputBaseFileName=Millix_Setup
Compression=lzma/max
;.bmp format only. 164x314 max resoltuion.
WizardImageFile=.\app\iconWizard.bmp
;small bitmap is 55x58 pixels.
WizardSmallImageFile=.\app\iconWizardSmall.bmp
WizardImageStretch=no

[Tasks]
; NOTE: The following entry contains English phrases ("Create a desktop icon" and "Additional icons").
; You are free to translate them into another language if required.
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"

[Files]
Source: ".\app\dist\millix\millix-win-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\Millix"; Filename: "{app}\Millix.exe"; WorkingDir: "{app}"; Comment: "Start Millix client"
; NOTE: The following entry contains an English phrase ("Uninstall"). You are free to translate it into another language if required.
Name: "{commondesktop}\Millix"; Filename: "{app}\Millix.exe"; Tasks: desktopicon; WorkingDir: "{app}"; Comment: "Start Millix client"

[Run]
; NOTE: The following entry contains an English phrase ("Launch"). You are free to translate it into another language if required.
Filename: "{app}\Millix.exe"; Description: "Launch Millix client"; Flags: nowait postinstall skipifsilent
