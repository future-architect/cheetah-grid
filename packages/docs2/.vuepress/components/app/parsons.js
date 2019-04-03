
/* global cheetahGrid */
'use strict'
const generatePerson = (function () {
  const fnames = [
    'Sophia',
    'Emma',
    'Olivia',
    'Isabella',
    'Ava',
    'Mia',
    'Emily',
    'Abigail',
    'Madison',
    'Elizabeth',
    'Charlotte',
    'Avery',
    'Sofia',
    'Chloe',
    'Ella',
    'Harper',
    'Amelia',
    'Aubrey',
    'Addison',
    'Evelyn',
    'Natalie',
    'Grace',
    'Hannah',
    'Zoey',
    'Victoria',
    'Lillian',
    'Lily',
    'Brooklyn',
    'Samantha',
    'Layla',
    'Zoe',
    'Audrey',
    'Leah',
    'Allison',
    'Anna',
    'Aaliyah',
    'Savannah',
    'Gabriella',
    'Camila',
    'Aria',
    'Noah',
    'Liam',
    'Jacob',
    'Mason',
    'William',
    'Ethan',
    'Michael',
    'Alexander',
    'Jayden',
    'Daniel',
    'Elijah',
    'Aiden',
    'James',
    'Benjamin',
    'Matthew',
    'Jackson',
    'Logan',
    'David',
    'Anthony',
    'Joseph',
    'Joshua',
    'Andrew',
    'Lucas',
    'Gabriel',
    'Samuel',
    'Christopher',
    'John',
    'Dylan',
    'Isaac',
    'Ryan',
    'Nathan',
    'Carter',
    'Caleb',
    'Luke',
    'Christian',
    'Hunter',
    'Henry',
    'Owen',
    'Landon',
    'Jack'
  ]
  const lnames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Miller',
    'Davis',
    'Garcia',
    'Rodriguez',
    'Wilson',
    'Martinez',
    'Anderson',
    'Taylor',
    'Thomas',
    'Hernandez',
    'Moore',
    'Martin',
    'Jackson',
    'Thompson',
    'White',
    'Lopez',
    'Lee',
    'Gonzalez',
    'Harris',
    'Clark',
    'Lewis',
    'Robinson',
    'Walker',
    'Perez',
    'Hall',
    'Young',
    'Allen',
    'Sanchez',
    'Wright',
    'King',
    'Scott',
    'Green',
    'Baker',
    'Adams',
    'Nelson',
    'Hill',
    'Ramirez',
    'Campbell',
    'Mitchell',
    'Roberts',
    'Carter',
    'Phillips',
    'Evans',
    'Turner',
    'Torres',
    'Parker',
    'Collins',
    'Edwards',
    'Stewart',
    'Flores',
    'Morris',
    'Nguyen',
    'Murphy',
    'Rivera',
    'Cook',
    'Rogers',
    'Morgan',
    'Peterson',
    'Cooper',
    'Reed',
    'Bailey',
    'Bell',
    'Gomez',
    'Kelly',
    'Howard',
    'Ward',
    'Cox',
    'Diaz',
    'Richardson',
    'Wood',
    'Watson',
    'Brooks',
    'Bennett',
    'Gray',
    'James',
    'Reyes',
    'Cruz',
    'Hughes',
    'Price',
    'Myers',
    'Long',
    'Foster',
    'Sanders',
    'Ross',
    'Morales',
    'Powell',
    'Sullivan',
    'Russell',
    'Ortiz',
    'Jenkins',
    'Gutierrez',
    'Perry',
    'Butler',
    'Barnes',
    'Fisher'
  ]
  const msOfYear = 365 * 24 * 60 * 60 * 1000
  return function (index) {
    const fname = fnames[Math.floor(Math.random() * fnames.length)]
    const lname = lnames[Math.floor(Math.random() * lnames.length)]
    let birthday = new Date(Date.now() - (20 * msOfYear) - Math.floor(Math.random() * 15 * msOfYear))
    birthday = new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate(), 0, 0, 0, 0)
    return {
      personid: index + 1,
      fname,
      lname,
      email: (`${fname.replace('-', '_')}_${lname.replace('-', '_')}@example.com`).toLowerCase(),
      birthday
    }
  }
})()

function generatePersons (num, initId = 1) {
  const records = []
  for (let i = 0; i < num; i++) {
    records.push(generatePerson(initId + i - 1))
  }
  return records
}

function generatePersonsDataSource (num) {
  const array = new Array(num)
  return new cheetahGrid.data.CachedDataSource({
    get (index) {
      return array[index] ? array[index] : (array[index] = generatePerson(index))
    },
    length: num
  })
}
// eslint-disable-next-line no-new-func
const g = Function('return this')()
g.generatePersons = generatePersons
g.generatePersonsDataSource = generatePersonsDataSource
g.generatePerson = generatePerson

g.records = generatePersons(100)
