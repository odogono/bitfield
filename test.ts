import { BitField } from './index';

describe('BitField', () => {
    it('getting', () => {
        let bf = new BitField();

        bf.set(2, true);

        bf.set(128, true);

        expect(bf.get(0)).toBe(false);

        expect(bf.get(2)).toBe(true);

        expect(bf.get(128)).toBe(true);

        expect(bf.get(9456)).toBe(false);
    });

    it('should return a binary string', () => {
        let bf = new BitField();

        bf.set(0, true);
        bf.set(5, true);

        expect(bf.toString()).toEqual('100001');

        expect(BitField.create().toString()).toEqual('0');
    });

    it('counts the number of true values', () => {
        let bf = new BitField();

        expect(bf.count()).toEqual(0);

        bf.set(2, true);
        bf.set(12, true);
        bf.set(125, true);

        expect(bf.count()).toEqual(3);
    });

    it('should logicaly AND with another instance', () => {
        let a = new BitField(),
            b = new BitField(),
            c = new BitField();

        a.set(10, true);
        a.set(11, false);
        a.set(12, true);
        a.set(13, false);

        b.set(10, true);
        b.set(11, true);
        b.set(12, false);
        b.set(13, false);

        a.and(c, b);

        expect(c.toString()).toEqual('10000000000');
    });

    it('should AND BitField instances', () => {
        const expectAnd = (a, b) =>
            expect(BitField.and(BitField.create(a), BitField.create(b)));

        expectAnd('1000', '1000').toBe(true);

        expectAnd('10000100000010000', '10000100000010010').toBe(true);

        expectAnd('1001000', '1101011').toBe(true);

        expectAnd('1101011', '1001000').toBe(false);

        expectAnd('01010', '01100').toBe(false);

        expectAnd('11010', '1000000010').toBe(false);

        expectAnd('1000', '1000').toBe(true);
        expectAnd('1000', '1010').toBe(true);
        expectAnd('1000', '1100').toBe(true);
        expectAnd('0110', '1001').toBe(false);
        expectAnd('0000', '0000').toBe(true);

        // expectAnd( [ 6, 8 ], [1,6,7,8] ).toBe(false);

    });

    it('should AND large strings', () => {
        const a =
            '10000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
        const b =
            '10000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000';
        expect(
            BitField.and(BitField.create(a), BitField.create(b))
        ).toBeTruthy();
    });

    it('should bitwise OR ', () => {
        const expectOr = (a, b) =>
            expect(BitField.or(BitField.create(a), BitField.create(b)));

        expectOr('1000', '1000').toBe(true);

        expectOr('10000100000010000', '10000100000010010').toBe(true);

        expectOr('1001000', '1101011').toBe(true);

        // expectOr('1101011', '1001000').toBe(false);

        // expectOr('01010', '01100').toBe(false);

        // expectOr('11010', '1000000010').toBe(false);

        expectOr('1000', '1000').toBe(true);
        expectOr('1000', '1010').toBe(true);
        expectOr('1000', '1100').toBe(true);
        expectOr('0110', '1001').toBe(false);
        expectOr('0000', '0000').toBe(false);

        expectOr(
            '10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000',
            '1000000000000000000000000000000010000'
        ).toBeTruthy();
    });

    it('NOR', () => {
        const nor = (a, b) =>
            BitField.nor(BitField.create(a), BitField.create(b));

        expect(nor('all', '0')).toEqual(false);

        expect(nor('1000', '0100')).toBeTruthy();

        expect(nor('1000', '1000')).toBeFalsy();

        expect(nor('1000', 'all')).toBeFalsy();
    });

    it.skip('should logically AND and return value indicating difference', () => {
        // let a = new BitField(),
        //     b = new BitField();

        // a.set(4, true);
        // a.set(6, true);

        // expect(a.and(null, b)).toEqual(false);
        // expect(a.and(null, b, a)).toEqual(false);

        // b.set(4, true);
        // b.set(6, true);
        // b.set(8, true);

        // // returns true because of a match
        // expect(a.and(null, b)).toEqual(true);

        // b.set(4, false);
        // // log.debug( a.toString() + ' ' + b.toString() );
        // // 001010000
        // // 101000000
        // // true because a&b == 0

        // expect(a.and(null, b)).toEqual(true);
        // // false because a&b != a
        // expect(a.and(null, b, a)).toEqual(false);
    });

    it('difference between two bitfields', () => {
        const a = new BitField();
        const b = new BitField();

        a.setValues([4, 6, 8, 12], true); // 1000101010000
        b.setValues([2, 6, 8, 12], true); // 1000101000100

        // returns the values that are set in b but not in a
        const c = a.difference(null, b);

        expect(c.toJSON()).toEqual([2]);
    });

    it('equality', () => {
        let a = new BitField(),
            b = new BitField();

        a.set(2000, true);
        a.set(16, true);
        b.set(16, true);

        expect(a.equals(b)).toEqual(false);

        a.set(2000, false);
        expect(a.equals(b)).toEqual(true);
    });
    

    it('special mode all', () => {
        let a = BitField.create('all');
        let b = BitField.create('all');

        expect(a.get(68434038716));

        expect(a.toString()).toEqual('all');

        // both are equal
        expect(a.equals(b));

        b = BitField.create('0110010');
        
        a.set(23, true);
        expect(a.toString()).toEqual('100000000000000000000000');

        // the countfield of an All bitfield will be max value
        a = BitField.create('all');
        expect(a.count()).toEqual(Number.MAX_VALUE);
    });

    it('setValues', () => {
        let a = BitField.create();
        let values = [0, 22, 65, 129, 340, 1198];
        a.setValues(values, true);
        for (let ii = 0; ii < values.length; ii++) {
            expect(a.get(values[ii]));
        }
        a.setValues([22, 129], false);
        expect(a.get(22)).toEqual(false);
        expect(a.get(129)).toEqual(false);
    });

    it('null setValues', () => {
        let a = BitField.create();
        a.setValues(null, true);
    });

    it('toValues', () => {
        let a = BitField.create();
        let values = [1, 29, 96, 311, 432];
        for (let ii = 0; ii < values.length; ii++) {
            a.set(values[ii], true);
        }
        expect(a.toValues()).toEqual(values);
    });

    it('setting with another instance', () => {
        let a = BitField.create();
        a.setValues([2, 6, 10], true);
        let b = BitField.create();
        b.setValues([3, 7, 9], true);

        let c = BitField.create();
        c.set(a);
        c.set(b);

        expect(c.toValues()).toEqual([2, 3, 6, 7, 9, 10]);

        let d = BitField.create(c);

        expect(d.toValues()).toEqual([2, 3, 6, 7, 9, 10]);
    });
});
