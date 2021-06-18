; File: Adder.asm
; Author: Michael Bianconi
; Created: 23 Jan 2021

DEFINE  y  VA
DEFINE  x1 VB
DEFINE  x2 VC
DEFINE  x3 VD
DEFINE  num     VE
DEFINE  numAddr 0x100

        ; Initialize registers
        LD      y,  0   
        LD      x1, 0
        LD      x2, 8
        LD      x3, 16

start:
        CALL    display     ; Display current number
        LD      V0, K       ; Wait for input
        ADD     num, V0     ; Add to current number
        LD      I, numAddr  ; Get ready to store number
        LD      B, num      ; Store BCD in memory
        JP      start       ; Go back to the beginning
        
display:
        CLS                 ; Clear the screen
        LD      I, numAddr  ; Load address of number
        LD      V2, [I]     ; Load number into registers
        LD      F, V0       ; Set I to hundreds place
        DRW     x1, y, 5    ; Draw hundreds place
        LD      F, V1       ; Set I to tens place
        DRW     x2, y, 5    ; Draw tens place
        LD      F, V2       ; Set I to ones place
        DRW     x3, y, 5    ; Draw ones place
        RET                 ; Return
        
