import Assembler from "./Assembler";
let readline = require('readline');
let fs = require('fs');

const SOURCE_DIR = __dirname + '/samples/source/';
const SOURCE_EXT = '.ch8';
const EXPECT_EXT = '.ch8b';

test('SYS Addr => 0nnn', () => {
    expect(Assembler.assemble('SYS 0x000')).toStrictEqual([0x0000]);
    expect(Assembler.assemble('SYS 0x154')).toStrictEqual([0x0154]);
    expect(Assembler.assemble('SYS 0x0F0')).toStrictEqual([0x00F0]);
    expect(() => Assembler.assemble('SYS 0x1111')).toThrow(Error);
    expect(() => Assembler.assemble('SYS')).toThrow(Error);
    expect(() => Assembler.assemble('SYS 0x54, 0xF')).toThrow(Error);
    expect(() => Assembler.assemble('SYS V0')).toThrow(Error);
});

test('CLS => 00E0', () => {
    expect(Assembler.assemble('CLS')).toStrictEqual([0x00E0]);
    expect(() => Assembler.assemble('CLS 0x5')).toThrow(Error);
});

test('RET => 00EE', () => {
    expect(Assembler.assemble('RET')).toStrictEqual([0x00EE]);
    expect(() => Assembler.assemble('RET 0xF, 0x46')).toThrow(Error);
});

test('JP Addr => 1000', () => {
    expect(Assembler.assemble('JP 0x000')).toStrictEqual([0x1000]);
    expect(Assembler.assemble('JP 0x154')).toStrictEqual([0x1154]);
    expect(Assembler.assemble('JP 0x0F0')).toStrictEqual([0x10F0]);
    expect(() => Assembler.assemble('JP 0x1111')).toThrow(Error);
    expect(() => Assembler.assemble('JP')).toThrow(Error);
    expect(() => Assembler.assemble('JP 0x54, 0xF')).toThrow(Error);
});

test('CALL Addr => 2nnn', () => {
    expect(Assembler.assemble('CALL 0x000')).toStrictEqual([0x2000]);
    expect(Assembler.assemble('CALL 0x154')).toStrictEqual([0x2154]);
    expect(Assembler.assemble('CALL 0x0F0')).toStrictEqual([0x20F0]);
    expect(() => Assembler.assemble('CALL 0x1111')).toThrow(Error);
    expect(() => Assembler.assemble('CALL')).toThrow(Error);
    expect(() => Assembler.assemble('CALL 0x54, 0xF')).toThrow(Error);
});

test('SE Vx, Byte => 3xkk', () => {
   expect(Assembler.assemble('SE V0, 0x54')).toStrictEqual([0x3054]);
   expect(Assembler.assemble('SE V5, 0x00')).toStrictEqual([0x3500]);
   expect(Assembler.assemble('SE VF, 0xFF')).toStrictEqual([0x3FFF]);
   expect(() => Assembler.assemble('SE VG, 0x54')).toThrow(Error);
   expect(() => Assembler.assemble('SE V0, 0x400')).toThrow(Error);
   expect(() => Assembler.assemble('SE V0')).toThrow(Error);
   expect(() => Assembler.assemble('SE V0, 0x54, 0xF')).toThrow(Error);
});

test('SNE Vx, Byte => 4xkk', () => {
    expect(Assembler.assemble('SNE V0, 0x54')).toStrictEqual([0x4054]);
    expect(Assembler.assemble('SNE V5, 0x00')).toStrictEqual([0x4500]);
    expect(Assembler.assemble('SNE VF, 0xFF')).toStrictEqual([0x4FFF]);
    expect(() => Assembler.assemble('SNE VG, 0x54')).toThrow(Error);
    expect(() => Assembler.assemble('SNE V0, 0x400')).toThrow(Error);
    expect(() => Assembler.assemble('SNE V0')).toThrow(Error);
    expect(() => Assembler.assemble('SNE V0, 0x54, 0xF')).toThrow(Error);
});

test('SE Vx, Vy => 5xy0', () => {
    expect(Assembler.assemble('SE V0, V0')).toStrictEqual([0x5000]);
    expect(Assembler.assemble('SE V5, V0')).toStrictEqual([0x5500]);
    expect(Assembler.assemble('SE VF, VF')).toStrictEqual([0x5FF0]);
    expect(() => Assembler.assemble('SE VG, VF')).toThrow(Error);
    expect(() => Assembler.assemble('SE V0, VFF')).toThrow(Error);
    expect(() => Assembler.assemble('SE V0')).toThrow(Error);
    expect(() => Assembler.assemble('SE V0, V1, 0xF')).toThrow(Error);
});

test('LD Vx, Byte => 6xkk', () => {
    expect(Assembler.assemble('LD V0, 0x0')).toStrictEqual([0x6000]);
    expect(Assembler.assemble('LD VF, 0xFF')).toStrictEqual([0x6FFF]);
    expect(() => Assembler.assemble('LD V3')).toThrow(Error);
    expect(() => Assembler.assemble('LD V3, 0xFF, 0xEE')).toThrow(Error);
    expect(() => Assembler.assemble('VD V3, 0xFF1')).toThrow(Error);
});

test('ADD Vx, BYTE => 7xkk', () => {
    expect(Assembler.assemble('ADD V4, 0x5')).toStrictEqual([0x7405]);
    expect(Assembler.assemble('ADD V7, 0xFA')).toStrictEqual([0x77FA]);
    expect(() => Assembler.assemble('ADD V7')).toThrow(Error);
    expect(() => Assembler.assemble('ADD V7, V6, V5')).toThrow(Error);
});

test('LD Vx, Vy => 8xy0', () => {
    expect(Assembler.assemble('LD V0, V0')).toStrictEqual([0x8000]);
    expect(Assembler.assemble('LD VF, VF')).toStrictEqual([0x8FF0]);
    expect(() => Assembler.assemble('LD V3')).toThrow(Error);
    expect(() => Assembler.assemble('LD V3, V4, V5')).toThrow(Error);
});

test('OR Vx, Vy => 8xy1', () => {
    expect(Assembler.assemble('OR V0, V0')).toStrictEqual([0x8001]);
    expect(Assembler.assemble('OR VF, VF')).toStrictEqual([0x8FF1]);
    expect(() => Assembler.assemble('OR V3')).toThrow(Error);
    expect(() => Assembler.assemble('OR V3, V4, V5')).toThrow(Error);
});

test('ADD I, Vx', () => {
    expect(Assembler.assemble('ADD I, V4')).toStrictEqual([0xF41E]);
    expect(Assembler.assemble('ADD I, VF')).toStrictEqual([0xFF1E]);
    expect(() => Assembler.assemble('ADD I, F')).toThrow(Error);
    expect(() => Assembler.assemble('ADD I  V6')).toThrow(Error);
    expect(() => Assembler.assemble('ADD I, Vx')).toThrow(Error);
    expect(() => Assembler.assemble('ADD I, V-4')).toThrow(Error);
});

test('ADD Vx, Vy', () => {
    expect(Assembler.assemble('ADD V4, V5')).toStrictEqual([0x8454]);
    expect(Assembler.assemble('ADD V0, VF')).toStrictEqual([0x80F4]);
});

test('DRW Vx, Vy, Nibble', () => {
    expect(Assembler.assemble("DRW V1, V2, 0x3")).toStrictEqual([0xD123]);
    expect(Assembler.assemble("DRW VF, V0, 10")).toStrictEqual([0xDF0A]);
    expect(Assembler.assemble("0xDF0A")).toStrictEqual([0xDF0A]);
});

describe('Math', () => {
    test('test 1', () => {
        expect(Assembler.assemble("LD V0, 5 + 1")).toStrictEqual([0x6006]);
    });
});

describe('ch8 - ch8b comparison tests', () => {

    test('AllFonts', () => {
        compare('AllFonts');
    });

    function compare(filename) {
        let source = SOURCE_DIR + filename + SOURCE_EXT;
        let expected = SOURCE_DIR + filename + EXPECT_EXT;
        let sourceLines = getLines(source);
        let expectedLines = getLines(expected);
        console.log(sourceLines);
        let sourceAsm = Assembler.assemble(...sourceLines);
        let expectedAsm = Assembler.assemble(...expectedLines);
        expect(sourceAsm).toStrictEqual(expectedAsm);
    }

    function getLines(inputFile) {
        try {
            let data = fs.readFileSync(inputFile, 'utf8');
            return data.split(/\r?\n/);
        } catch (err) {
            console.error(err)
        }
        return [];
    }
});