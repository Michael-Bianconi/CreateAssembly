; File: Tic Tac Toe
; Author: Michael Bianconi
; Created: 28 December 2020

DEFINE TRUE 1
DEFINE FALSE 0

DEFINE SQ_UNCLAIMED 0       ; Value of empty board square
DEFINE SQ_X 1               ; Value of square with an X
DEFINE SQ_O 10              ; Value of square with a 0
DEFINE BOARD_DATA 0x100     ; Board data address (9 bytes)

DEFINE INPROGRESS_STATE 0
DEFINE WIN_STATE 3
DEFINE LOSE_STATE 30

; NOTE: Registers V0 through V8 are reserved for board data
; and may change during subroutines.
DEFINE playerKeypress VA    ; Store player keypress here
DEFINE s0 VB                ; Subroutine register 0
DEFINE s1 VC                ; Subroutine register 1
DEFINE s2 VD                ; Subroutine register 2
DEFINE retval VE            ; Subroutines will store return values here

; BOARD LAYOUT
; V0 V1 V2
; V3 V4 V5
; V6 V7 V8

initFontData:
        LD      F, 0;               
        LD      V0, 0x80;
        
mainloop:
        CALL    checkBoardState     ; Check for a win/loss
        LD      playerKeypress, K   ; If not, wait for keypress
        CALL    isValidKeypress     ; Check valid keypress
        SE      retval, TRUE        ; If not,
        JP      mainloop            ; Try again
        CALL    updateBoard         ; Else, update board data
        CALL    checkBoardState     ; Check for a win/loss
        CALL    aiTurn              ; If not, do AI's turn
        JP      mainloop            ; Go to top of loop
        

; Given the square in playerKeypress,
; check if the square is claimed or not.
; Return:
;   True if empty, false otherwise.
isValidKeypress:
        LD      I, BOARD_DATA       ; Set I to board data
        ADD     I, playerKeypress   ; Go to specified square
        LD      [I], V0             ; Load square into V0
        LD      retval, TRUE        ; retval is true by default
        SE      V0, SQ_UNCLAIMED    ; If not empty
        LD      retval, FALSE       ; Set retval to false
        RET
        

; Check the board for a win or loss. If so,
; Transition to the appropriate state. If not,
; return.        
checkBoardState:
        LD      I, BOARD_DATA
        LD      [I], V8             ; Load all 8 squares
        LD      s0, V0              ; XXX
        LD      s1, V1              ; ...
        LD      s2, V2              ; ...
        CALL    checkRowState
        LD      s0, V3              ; ...
        LD      s1, V4              ; XXX
        LD      s2, V5              ; ...
        CALL    checkRowState
        LD      s0, V6              ; ...
        LD      s1, V7              ; ...
        LD      s2, V8              ; XXX
        CALL    checkRowState
        LD      s0, V0              ; X..
        LD      s1, V3              ; X..
        LD      s2, V6              ; X..
        CALL    checkRowState
        LD      s0, V1              ; .X.
        LD      s1, V4              ; .X.
        LD      s2, V7              ; .X.
        CALL    checkRowState
        LD      s0, V2              ; ..X
        LD      s1, V5              ; ..X
        LD      s2, V8              ; ..X
        CALL    checkRowState
        LD      s0, V0              ; X..
        LD      s1, V4              ; .X.
        LD      s2, V8              ; ..X
        CALL    checkRowState
        LD      s0, V2              ; ..X
        LD      s1, V4              ; .X.
        LD      s2, V6              ; X..
        CALL    checkRowState
        RET                         ; No win, return  


; Given 3 squares, check if they lead to a three
; in a row. If so, jump to win/lose. Else, return.
; Args:
;       s0: Value of first square in row
;       s1: Value of second square in row
;       s2: Value of third square in row
checkRowState:
        ADD     s0, s1          ; Add all three values up
        ADD     s0, s2
        SNE     s0, WIN_STATE   ; If value constitutes a win,
        JP      win             ; Jump to win
        SNE     s0, LOSE_STATE  ; Else if value is loss,
        JP      lose            ; Jump to lose
        RET                     ; Else, return

win:  ; TODO

lose:  ; TODO
        
        
        
