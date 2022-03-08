import * as validation from './../src';

describe('STRING', () => {
    let string = new validation.StringValidator();

    beforeEach(async () => {
        string = new validation.StringValidator();
    });

    test('#required: should return err false if there is a value given and that this value is not empty', async () => {
        string = string.required();

        await expect(string.validate('a')).resolves.toBe('a');
        await expect(string.validate(1)).resolves.toBe('1');
        await expect(string.validate(-1)).resolves.toBe('-1');
        await expect(string.validate(function() {})).resolves.toBe('function () { }');
        await expect(string.validate(() => {})).resolves.toBe('() => { }');
        await expect(string.validate(['a','b'])).resolves.toBe('a,b');
        await expect(string.validate({'a':'b'})).resolves.toBe('[object Object]');
        await expect(string.validate(null)).resolves.toBe(null);
    })

    test('#required: should return an array of err if there is no value providen or that the value is empty', async () => {
        string = string.required();

        await expect(string.validate('')).rejects.not.toBeUndefined();
        await expect(string.validate(undefined)).rejects.not.toBeUndefined();
    })

    test('#min: should return err false if test is bigger or equal than min size', async () => {
        string = string.min(3);

        await expect(string.validate(undefined)).resolves.toBeUndefined();
        await expect(string.validate('abc')).resolves.toBe('abc');
        await expect(string.validate('abcd')).resolves.toBe('abcd');
        await expect(string.validate(null)).resolves.toBe(null);
        await expect(string.validate(['a','b'])).resolves.toBe('a,b');
        await expect(string.validate(['ab','c'])).resolves.toBe('ab,c');
    })

    test('#min: should return an array of error if test is smaller than min size', async () => {
        string = string.min(3);

        await expect(string.validate('ab')).rejects.not.toBeUndefined();
        await expect(string.validate(4)).rejects.not.toBeUndefined();
        await expect(string.validate(2)).rejects.not.toBeUndefined();
        await expect(string.validate(['a'])).rejects.not.toBeUndefined();
        await expect(string.validate(['','',''])).rejects.not.toBeUndefined();
    })

    test('#max: should return err false if test is smaller or equal than min size', async () => {
        string = string.max(3);

        await expect(string.validate(undefined)).resolves.toBeUndefined();
        await expect(string.validate('abc')).resolves.toBe('abc');
        await expect(string.validate('ab')).resolves.toBe('ab');
        await expect(string.validate(null)).resolves.toBe(null);
        await expect(string.validate(['a','b'])).resolves.toBe('a,b');
        await expect(string.validate(5)).resolves.toBe('5');
    })

    test('#max: should return an array of error if test is bigger than min size', async () => {
        string = string.max(3);

        await expect(string.validate('abcd')).rejects.not.toBeUndefined();
        await expect(string.validate(['ab','c'])).rejects.not.toBeUndefined();
        await expect(string.validate(1234)).rejects.not.toBeUndefined();
    })

    test('#strictMin: should return err false if test is bigger than min size', async () => {
        string = string.strictMin(3);

        await expect(string.validate(undefined)).resolves.toBeUndefined();
        await expect(string.validate('abcd')).resolves.toBe('abcd');
        await expect(string.validate(null)).resolves.toBe(null);
    })

    test('#strictMin: should return an array of error if test is smaller or equal than min size', async () => {
        string = string.strictMin(3);

        await expect(string.validate('abc')).rejects.not.toBeUndefined();
        await expect(string.validate('ab')).rejects.not.toBeUndefined();
    })

    test('#strictMax: should return err false if test is smaller than max size', async () => {
        string = string.strictMax(3);

        await expect(string.validate(undefined)).resolves.toBeUndefined();
        await expect(string.validate(null)).resolves.toBe(null);
        await expect(string.validate('ab')).resolves.toBe('ab');
    })

    test('#strictMax: should return an array of error if test is bigger or equal than max size', async () => {
        string = string.strictMax(3);

        await expect(string.validate('abc')).rejects.not.toBeUndefined();
        await expect(string.validate('abcd')).rejects.not.toBeUndefined();
    })

    test('#matches: should return err false if the test match the regex', async () => {
        string = string.matches(/a/g);

        await expect(string.validate(undefined)).resolves.toBeUndefined();
        await expect(string.validate(null)).resolves.toBe(null);
        await expect(string.validate('a')).resolves.toBe('a');
        await expect(string.validate('abc')).resolves.toBe('abc');
        await expect(string.validate('bac')).resolves.toBe('bac');
    })

    test('#matches: should return an array of errors if the test not match the regex or if the text is empty', async () => {
        string = string.matches(/a/g);

        await expect(string.validate('bc')).rejects.not.toBeUndefined();
        await expect(string.validate('')).rejects.not.toBeUndefined();
    })

    // email from https://www.wikiwand.com/en/Email_address#/cite_note-20/syntax
    test('#email: should pass valid email', async () => {
        string = string.isEmail();

        await expect(string.validate(undefined)).resolves.toBeUndefined();
        await expect(string.validate(null)).resolves.toBe(null);
        await expect(string.validate('simple@example.com')).resolves.toBe('simple@example.com');
        await expect(string.validate('very.common@example.com')).resolves.toBe('very.common@example.com');
        await expect(string.validate('disposable.style.email.with+symbol@example.com')).resolves.toBe('disposable.style.email.with+symbol@example.com');
        await expect(string.validate('other.email-with-hyphen@example.com')).resolves.toBe('other.email-with-hyphen@example.com');
        await expect(string.validate('fully-qualified-domain@example.com')).resolves.toBe('fully-qualified-domain@example.com');
        await expect(string.validate('user.name+tag+sorting@example.com')).resolves.toBe('user.name+tag+sorting@example.com');
        await expect(string.validate('x@example.com')).resolves.toBe('x@example.com');
        await expect(string.validate('"very.(),:;<>[]\".VERY.\"very@\\ \"very\".unusual"@strange.example.com')).resolves.toBe('"very.(),:;<>[]\".VERY.\"very@\\ \"very\".unusual"@strange.example.com');
        await expect(string.validate('example-indeed@strange-example.com')).resolves.toBe('example-indeed@strange-example.com');
        await expect(string.validate('admin@mailserver1')).resolves.toBe('admin@mailserver1');
        await expect(string.validate('#!$%&\'*+-/=?^_`{}|~@example.org')).resolves.toBe('#!$%&\'*+-/=?^_`{}|~@example.org');
        await expect(string.validate('"()<>[]:,;@\\\"!#$%&\'-/=?^_`{}| ~.a"@example.org')).resolves.toBe('"()<>[]:,;@\\\"!#$%&\'-/=?^_`{}| ~.a"@example.org');
        await expect(string.validate('example@s.example')).resolves.toBe('example@s.example');
        await expect(string.validate('user@[2001:DB8::1]')).resolves.toBe('user@[2001:DB8::1]');
        await expect(string.validate('" "@example.org')).resolves.toBe('" "@example.org');
    })

    test('#email: should return invalid email', async () => {
        string = string.isEmail();

        await expect(string.validate('')).rejects.not.toBeUndefined();
        await expect(string.validate('Abc.example.com')).rejects.not.toBeUndefined();
        await expect(string.validate('A@b@c@example.com')).rejects.not.toBeUndefined();
        await expect(string.validate('a"b(c)d,e:f;g<h>i[j\k]l@example.com')).rejects.not.toBeUndefined();
        await expect(string.validate('just"not"right@example.com')).rejects.not.toBeUndefined();
        await expect(string.validate('this is"not\allowed@example.com')).rejects.not.toBeUndefined();
        await expect(string.validate('this\ still\"not\\allowed@example.com')).rejects.not.toBeUndefined();
        await expect(string.validate('1234567890123456789012345678901234567890123456789012345678901234+x@example.com')).rejects.not.toBeUndefined();
        await expect(string.validate('john..doe@example.com')).rejects.not.toBeUndefined();
        await expect(string.validate('john.doe@example..com')).rejects.not.toBeUndefined();
    })

    // https://mathiasbynens.be/demo/url-regex
    test('#url: should return valid url', async () => {
        string = string.isUrl();

        await expect(string.validate(undefined)).resolves.toBeUndefined();
        await expect(string.validate(null)).resolves.toBe(null);
        await expect(string.validate('http://foo.com/blah_blah')).resolves.toBe('http://foo.com/blah_blah');
        await expect(string.validate('http://foo.com/blah_blah/')).resolves.toBe('http://foo.com/blah_blah/');
        await expect(string.validate('http://foo.com/blah_blah_(wikipedia)')).resolves.toBe('http://foo.com/blah_blah_(wikipedia)');
        await expect(string.validate('http://foo.com/blah_blah_(wikipedia)_(again)')).resolves.toBe('http://foo.com/blah_blah_(wikipedia)_(again)');
        await expect(string.validate('http://www.example.com/wpstyle/?p=364')).resolves.toBe('http://www.example.com/wpstyle/?p=364');
        await expect(string.validate('https://www.example.com/foo/?bar=baz&inga=42&quux')).resolves.toBe('https://www.example.com/foo/?bar=baz&inga=42&quux');
        await expect(string.validate('http://✪df.ws/123')).resolves.toBe('http://✪df.ws/123');
        await expect(string.validate('http://userid:password@example.com:8080')).resolves.toBe('http://userid:password@example.com:8080');
        await expect(string.validate('http://userid:password@example.com:8080/')).resolves.toBe('http://userid:password@example.com:8080/');
        await expect(string.validate('http://userid@example.com')).resolves.toBe('http://userid@example.com');
        await expect(string.validate('http://userid@example.com/')).resolves.toBe('http://userid@example.com/');
        await expect(string.validate('http://userid@example.com:8080')).resolves.toBe('http://userid@example.com:8080');
        await expect(string.validate('http://userid@example.com:8080/')).resolves.toBe('http://userid@example.com:8080/');
        await expect(string.validate('http://userid:password@example.com')).resolves.toBe('http://userid:password@example.com');
        await expect(string.validate('http://userid:password@example.com/')).resolves.toBe('http://userid:password@example.com/');
        await expect(string.validate('http://142.42.1.1/')).resolves.toBe('http://142.42.1.1/');
        await expect(string.validate('http://142.42.1.1:8080/')).resolves.toBe('http://142.42.1.1:8080/');
        await expect(string.validate('http://➡.ws/䨹')).resolves.toBe('http://➡.ws/䨹');
        await expect(string.validate('http://⌘.ws')).resolves.toBe('http://⌘.ws');
        await expect(string.validate('http://⌘.ws/')).resolves.toBe('http://⌘.ws/');
        await expect(string.validate('http://foo.com/blah_(wikipedia)#cite-1')).resolves.toBe('http://foo.com/blah_(wikipedia)#cite-1');
        await expect(string.validate('http://foo.com/blah_(wikipedia)_blah#cite-1')).resolves.toBe('http://foo.com/blah_(wikipedia)_blah#cite-1');
        await expect(string.validate('http://foo.com/unicode_(✪)_in_parens')).resolves.toBe('http://foo.com/unicode_(✪)_in_parens');
        await expect(string.validate('http://foo.com/(something)?after=parens')).resolves.toBe('http://foo.com/(something)?after=parens');
        await expect(string.validate('http://☺.damowmow.com/')).resolves.toBe('http://☺.damowmow.com/');
        await expect(string.validate('http://code.google.com/events/#&product=browser')).resolves.toBe('http://code.google.com/events/#&product=browser');
        await expect(string.validate('http://j.mp')).resolves.toBe('http://j.mp');
        await expect(string.validate('ftp://foo.bar/baz')).resolves.toBe('ftp://foo.bar/baz');
        await expect(string.validate('http://foo.bar/?q=Test%20URL-encoded%20stuff')).resolves.toBe('http://foo.bar/?q=Test%20URL-encoded%20stuff');
        await expect(string.validate('http://例子.测试')).resolves.toBe('http://例子.测试');
        await expect(string.validate('http://उदाहरण.परीक्षा')).resolves.toBe('http://उदाहरण.परीक्षा');
        await expect(string.validate('http://-.~_!$&\'()*+,;=:%40:80%2f::::::@example.com')).resolves.toBe('http://-.~_!$&\'()*+,;=:%40:80%2f::::::@example.com');
        await expect(string.validate('http://1337.net')).resolves.toBe('http://1337.net');
        await expect(string.validate('http://a.b-c.de')).resolves.toBe('http://a.b-c.de');
        await expect(string.validate('http://223.255.255.254')).resolves.toBe('http://223.255.255.254');
        await expect(string.validate('https://foo_bar.example.com/')).resolves.toBe('https://foo_bar.example.com/');
        await expect(string.validate('http://مثال.إختبار')).resolves.toBe('http://مثال.إختبار');
    })

    test('#url: should return invalid url', async () => {
        string = string.isUrl();

        await expect(string.validate('')).rejects.not.toBeUndefined();
        await expect(string.validate('http://')).rejects.not.toBeUndefined();
        await expect(string.validate('http://.')).rejects.not.toBeUndefined();
        await expect(string.validate('http://..')).rejects.not.toBeUndefined();
        await expect(string.validate('http://../')).rejects.not.toBeUndefined();
        await expect(string.validate('http://?')).rejects.not.toBeUndefined();
        await expect(string.validate('http://??')).rejects.not.toBeUndefined();
        await expect(string.validate('http://??/')).rejects.not.toBeUndefined();
        await expect(string.validate('http://#')).rejects.not.toBeUndefined();
        await expect(string.validate('http://##')).rejects.not.toBeUndefined();
        await expect(string.validate('http://##/')).rejects.not.toBeUndefined();
        await expect(string.validate('http://foo.bar?q=Spaces should be encoded')).rejects.not.toBeUndefined();
        await expect(string.validate('//')).rejects.not.toBeUndefined();
        await expect(string.validate('//a')).rejects.not.toBeUndefined();
        await expect(string.validate('///a')).rejects.not.toBeUndefined();
        await expect(string.validate('///')).rejects.not.toBeUndefined();
        await expect(string.validate('http:///a')).rejects.not.toBeUndefined();
        await expect(string.validate('foo.com')).rejects.not.toBeUndefined();
        await expect(string.validate('rdar://1234')).rejects.not.toBeUndefined();
        await expect(string.validate('h://test')).rejects.not.toBeUndefined();
        await expect(string.validate('http:// shouldfail.com')).rejects.not.toBeUndefined();
        await expect(string.validate(':// should fail')).rejects.not.toBeUndefined();
        await expect(string.validate('http://foo.bar/foo(bar)baz quux')).rejects.not.toBeUndefined();
        await expect(string.validate('ftps://foo.bar/')).rejects.not.toBeUndefined();
        await expect(string.validate('http://-error-.invalid/')).rejects.not.toBeUndefined();
        await expect(string.validate('http://a.b--c.de/')).rejects.not.toBeUndefined();
        await expect(string.validate('http://-a.b.co')).rejects.not.toBeUndefined();
        await expect(string.validate('http://a.b-.co')).rejects.not.toBeUndefined();
        await expect(string.validate('http://0.0.0.0')).rejects.not.toBeUndefined();
        await expect(string.validate('http://10.1.1.0')).rejects.not.toBeUndefined();
        await expect(string.validate('http://10.1.1.255')).rejects.not.toBeUndefined();
        await expect(string.validate('http://224.1.1.1')).rejects.not.toBeUndefined();
        await expect(string.validate('http://1.1.1.1.1')).rejects.not.toBeUndefined();
        await expect(string.validate('http://123.123.123')).rejects.not.toBeUndefined();
        await expect(string.validate('http://3628126748')).rejects.not.toBeUndefined();
        await expect(string.validate('http://.www.foo.bar/')).rejects.not.toBeUndefined();
        await expect(string.validate('http://www.foo.bar./')).rejects.not.toBeUndefined();
        await expect(string.validate('http://.www.foo.bar./')).rejects.not.toBeUndefined();
        await expect(string.validate('http://10.1.1.1')).rejects.not.toBeUndefined();
        await expect(string.validate('http://10.1.1.254')).rejects.not.toBeUndefined();
    })

    test('#enum: should return the value is it\'s containt in an array of string given', async () => {
        const enu: string[] = ['a','b','c'];
        string = string.enum(enu);

        await expect(string.validate(undefined)).resolves.toBeUndefined();
        await expect(string.validate(null)).resolves.toBe(null);
        await expect(string.validate('a')).resolves.toBe('a');
    });

    test('#enum: should return an array of error if the value is not in the array', async () => {
        const enu: string[] = ['a','b','c'];
        string = string.enum(enu);

        await expect(string.validate(1)).rejects.not.toBeUndefined();
        await expect(string.validate('1')).rejects.not.toBeUndefined();
        await expect(string.validate('d')).rejects.not.toBeUndefined();
    });

    test('#default: should return a default value', async () => {
        const defaultValue: string = 'default';
        string = string.default(defaultValue);

        await expect(string.validate(undefined)).resolves.toBe(undefined);
        await expect(string.min(0).validate(undefined)).resolves.toBe(undefined);
        await expect(string.validate(null)).resolves.toBe(null);

        string = string.required();

        await expect(string.validate(undefined)).resolves.toBe(defaultValue);
        await expect(string.min(0).validate(undefined)).resolves.toBe(defaultValue);
        await expect(string.validate(null)).resolves.toBe(null);

        string = string.notNull();

        await expect(string.validate(null)).resolves.toBe(defaultValue);
    })

    test('#default: should not return a default value', async () => {
        const defaultValue: string = 'default';
        string = string.default(defaultValue);

        await expect(string.validate('ab')).resolves.toBe('ab');
        string = string.required();
        await expect(string.validate('ab')).resolves.toBe('ab');
    })

    test('#notNull: should check if the value is null or not', async () => {
        string = string.notNull();

        await expect(string.validate(undefined)).resolves.toBe(undefined);
        await expect(string.validate('a')).resolves.toBe('a');
        await expect(string.validate(null)).rejects.not.toBeUndefined();
    })

    test('#is: should check if the value is equal to an other value', async () => {
        const valueToCheck: string = 'a';
        string = string.is(valueToCheck);

        await expect(string.validate(undefined)).resolves.toBe(undefined);
        await expect(string.validate(null)).resolves.toBe(null);
        await expect(string.validate(valueToCheck)).resolves.toBe(valueToCheck);
        await expect(string.validate('b')).rejects.not.toBeUndefined();
    })

    test('#toUppercase: should return the value to uppercase', async () => {
        string = string.toUppercase();

        await expect(string.validate('abc')).resolves.toBe('ABC');
        await expect(string.validate('Ab')).resolves.toBe('AB');
        await expect(string.validate('')).resolves.toBe('');
        await expect(string.validate(undefined)).resolves.toBe(undefined);
        await expect(string.validate(null)).resolves.toBe(null);
    })

    test('#toLowercase: should return the value to lowercase', async () => {
        string = string.toLowercase();

        await expect(string.validate('ABC')).resolves.toBe('abc');
        await expect(string.validate('Ab')).resolves.toBe('ab');
        await expect(string.validate('')).resolves.toBe('');
        await expect(string.validate(undefined)).resolves.toBe(undefined);
        await expect(string.validate(null)).resolves.toBe(null);
    })
});