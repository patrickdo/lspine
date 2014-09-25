; TITLE OF WINDOW TO FIND
lspine_window_title := "Lumbar Spondylosis Reporting Module"

; CONTROL+1 SAMPLE HOTKEY
^1::
lspine_copy()
Return

^2::
lspine_showhide()
Return

; COPY REPORT TO CLIPBOARD
lspine_copy()
{
	global lspine_window_title
	WinActivate, %lspine_window_title%

	IfWinActive, %lspine_window_title%
	{
		Send, ^f
		SendInput, Select All
		SendInput, {Escape}{Tab}+{Tab}{Enter}
		SendInput, ^c

		ToolTip, Copied
		SetTimer, RemoveToolTip, 1500

		Return
	}
	Else
	{
		MsgBox, 48, Alert, Please open the %lspine_window_title% and try again!
	}
}

; SHOW/HIDE LSPINE MODULE
lspine_showhide()
{
	global lspine_window_title
	IfWinActive, %lspine_window_title%
	{
		WinMinimize, %lspine_window_title%
	}
	Else
	{
		WinActivate, %lspine_window_title%
	}
	Return
}

; NEEDED TO REMOVE TOOLTIP
RemoveToolTip:
SetTimer, RemoveToolTip, Off
ToolTip
Return
