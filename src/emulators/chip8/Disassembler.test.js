import Disassembler from "./Disassembler";

test('SYS', () => {
    expect(Disassembler.disassemble(0x0000)).toBe('SYS 0x000');
    expect(Disassembler.disassemble(0x0111)).toBe('SYS 0x111');
    expect(Disassembler.disassemble(0x01FA)).toBe('SYS 0x1FA');
    expect(Disassembler.disassemble(0x0AAA)).toBe('SYS 0xAAA');
    expect(Disassembler.disassemble(0x0FFF)).toBe('SYS 0xFFF');
});

test('ADD', () => {
    expect(Disassembler.disassemble(0x7056)).toBe('ADD V0, 0x56');
});

test('JP', () => {
    expect(Disassembler.disassemble(0x1000)).toBe('JP 0x000');
    expect(Disassembler.disassemble(0x1FFF)).toBe('JP 0xFFF');
});

test('LD', () => {
    expect(Disassembler.disassemble(0x6000)).toBe('LD V0, 0x00');
    expect(Disassembler.disassemble(0x6005)).toBe('LD V0, 0x05');
    expect(Disassembler.disassemble(0x64FF)).toBe('LD V4, 0xFF');
    expect(Disassembler.disassemble(0xF455)).toBe('LD [I], V4');
});


test('SE', () => {
    expect(Disassembler.disassemble(0x3005)).toBe('SE V0, 0x05');
    expect(Disassembler.disassemble(0x31FF)).toBe('SE V1, 0xFF');
});

test('SNE', () => {
    expect(Disassembler.disassemble(0x4443)).toBe('SNE V4, 0x43');
});
