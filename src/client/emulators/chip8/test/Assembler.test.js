import Assembler from "../Assembler";

test('SYS Addr => 0nnn', () => {
    expect(Assembler.assembleLine('SYS 0X000')).toBe(0x0000);
    expect(Assembler.assembleLine('SYS 0X154')).toBe(0x0154);
    expect(Assembler.assembleLine('SYS 0X0F0')).toBe(0x00F0);
    expect(Assembler.assembleLine('SYS 0X1111')).toBeNull();
    expect(Assembler.assembleLine('SYS')).toBeNull();
    expect(Assembler.assembleLine('SYS 0X54, 0XF')).toBeNull();
    expect(Assembler.assembleLine('SYS V0')).toBeNull();
});

test('CLS => 00E0', () => {
    expect(Assembler.assembleLine('CLS')).toBe(0x00E0);
    expect(Assembler.assembleLine('CLS 0X5')).toBeNull();
});

test('RET => 00EE', () => {
    expect(Assembler.assembleLine('RET')).toBe(0x00EE);
    expect(Assembler.assembleLine('RET 0XF, 0X46')).toBeNull();
});

test('JP Addr => 1000', () => {
    expect(Assembler.assembleLine('JP 0X000')).toBe(0x1000);
    expect(Assembler.assembleLine('JP 0X154')).toBe(0x1154);
    expect(Assembler.assembleLine('JP 0X0F0')).toBe(0x10F0);
    expect(Assembler.assembleLine('JP 0X1111')).toBeNull();
    expect(Assembler.assembleLine('JP')).toBeNull();
    expect(Assembler.assembleLine('JP 0X54, 0XF')).toBeNull();
});

test('CALL Addr => 2nnn', () => {
    expect(Assembler.assembleLine('CALL 0X000')).toBe(0x2000);
    expect(Assembler.assembleLine('CALL 0X154')).toBe(0x2154);
    expect(Assembler.assembleLine('CALL 0X0F0')).toBe(0x20F0);
    expect(Assembler.assembleLine('CALL 0X1111')).toBeNull();
    expect(Assembler.assembleLine('CALL')).toBeNull();
    expect(Assembler.assembleLine('CALL 0X54, 0XF')).toBeNull();
});

test('SE Vx, Byte => 3xkk', () => {
   expect(Assembler.assembleLine('SE V0, 0X54')).toBe(0x3054);
   expect(Assembler.assembleLine('SE V5, 0X00')).toBe(0x3500);
   expect(Assembler.assembleLine('SE VF, 0XFF')).toBe(0x3FFF);
   expect(Assembler.assembleLine('SE VG, 0X54')).toBeNull();
   expect(Assembler.assembleLine('SE V0, 0X400')).toBeNull();
   expect(Assembler.assembleLine('SE V0')).toBeNull();
   expect(Assembler.assembleLine('SE V0, 0X54, 0XF')).toBeNull();
});

test('SNE Vx, Byte => 4xkk', () => {
    expect(Assembler.assembleLine('SNE V0, 0X54')).toBe(0x4054);
    expect(Assembler.assembleLine('SNE V5, 0X00')).toBe(0x4500);
    expect(Assembler.assembleLine('SNE VF, 0XFF')).toBe(0x4FFF);
    expect(Assembler.assembleLine('SNE VG, 0X54')).toBeNull();
    expect(Assembler.assembleLine('SNE V0, 0X400')).toBeNull();
    expect(Assembler.assembleLine('SNE V0')).toBeNull();
    expect(Assembler.assembleLine('SNE V0, 0X54, 0XF')).toBeNull();
});

test('SE Vx, Vy => 5xy0', () => {
    expect(Assembler.assembleLine('SE V0, V0')).toBe(0x5000);
    expect(Assembler.assembleLine('SE V5, V0')).toBe(0x5500);
    expect(Assembler.assembleLine('SE VF, VF')).toBe(0x5FF0);
    expect(Assembler.assembleLine('SE VG, VF')).toBeNull();
    expect(Assembler.assembleLine('SE V0, VFF')).toBeNull();
    expect(Assembler.assembleLine('SE V0')).toBeNull();
    expect(Assembler.assembleLine('SE V0, V1, 0XF')).toBeNull();
});

test('LD Vx, Byte => 6xkk', () => {
    expect(Assembler.assembleLine('LD V0, 0X0')).toBe(0x6000);
    expect(Assembler.assembleLine('LD VF, 0XFF')).toBe(0x6FFF);
    expect(Assembler.assembleLine('LD V3')).toBeNull();
    expect(Assembler.assembleLine('LD V3, 0XFF, 0XEE')).toBeNull();
    expect(Assembler.assembleLine('VD V3, 0XFF1')).toBeNull();
});

test('ADD Vx, BYTE => 7xkk', () => {
    expect(Assembler.assembleLine('ADD V4, 0X5')).toBe(0x7405);
    expect(Assembler.assembleLine('ADD V7, 0XFA')).toBe(0x77FA);
    expect(Assembler.assembleLine('ADD V7')).toBeNull();
    expect(Assembler.assembleLine('ADD V7, V6, V5')).toBeNull();
});

test('LD Vx, Vy => 8xy0', () => {
    expect(Assembler.assembleLine('LD V0, V0')).toBe(0x8000);
    expect(Assembler.assembleLine('LD VF, VF')).toBe(0x8FF0);
    expect(Assembler.assembleLine('LD V3')).toBeNull();
    expect(Assembler.assembleLine('LD V3, V4, V5')).toBeNull();
});

test('OR Vx, Vy => 8xy1', () => {
    expect(Assembler.assembleLine('OR V0, V0')).toBe(0x8001);
    expect(Assembler.assembleLine('OR VF, VF')).toBe(0x8FF1);
    expect(Assembler.assembleLine('OR V3')).toBeNull();
    expect(Assembler.assembleLine('OR V3, V4, V5')).toBeNull();
});

test('ADD I, Vx', () => {
    expect(Assembler.assembleLine('ADD I, V4')).toBe(0xF41E);
    expect(Assembler.assembleLine('ADD I, VF')).toBe(0xFF1E);
    expect(Assembler.assembleLine('ADD I, F')).toBeNull();
    expect(Assembler.assembleLine('ADD I  V6')).toBeNull();
    expect(Assembler.assembleLine('ADD I, Vx')).toBeNull();
    expect(Assembler.assembleLine('ADD I, V-4')).toBeNull();
});

test('ADD Vx, Vy', () => {
    expect(Assembler.assembleLine('ADD V4, V5')).toBe(0x8454);
    expect(Assembler.assembleLine('ADD V0, VF')).toBe(0x80F4);
});

test('DRW Vx, Vy, Nibble', () => {
    expect(Assembler.assembleLine("DRW V1, V2, 0X3")).toBe(0xD123);
    expect(Assembler.assembleLine("DRW VF, V0, 10")).toBe(0xDF0A);
});
