/* globals generatePersons, cheetahGrid */
export const girdInstances = []
export function createGrid (parentElement) {
  const records = generatePersons(100)

  const grid = new cheetahGrid.ListGrid({
    parentElement,
    header: [
      { field: 'check', caption: '', width: 50, columnType: 'check', action: 'check' },
      { field: 'personid', caption: 'ID', width: 100 },
      { /* multiple header */
        caption: 'name',
        columns: [
          { field: 'fname', caption: 'First Name', width: 200, sort: true },
          { field: 'lname', caption: 'Last Name', width: 200, sort: true }
        ]
      },
      {
        field: 'email',
        caption: 'Email',
        width: 250,
        sort: true,
        style (rec) {
          const index = records.indexOf(rec)
          if (index % 3 === 2) {
            return { indicatorTopLeft: 'triangle' }
          }
          return undefined
        }
      },
      {
      /* callback field */
        field (rec) {
          const d = rec.birthday
          return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
        },
        caption: 'birthday',
        width: 100,
        message (rec) {
          const index = records.indexOf(rec)
          switch (index % 3) {
            case 0: {
              return {
                type: 'info',
                message: 'Info Message.'
              }
            }
            case 1: {
              return {
                type: 'warning',
                message: 'Warn Message.'
              }
            }
          }
          return {
            type: 'error',
            message: 'Error Message.'
          }
        }
      },
      {
        caption: 'button',
        width: 120,
        /* button column */
        columnType: new cheetahGrid.columns.type.ButtonColumn({
          caption: 'SHOW REC'
        }),
        action: new cheetahGrid.columns.action.ButtonAction({
          action (rec) {
            alert(JSON.stringify(rec))
          }
        })
      }
    ],
    frozenColCount: 2,
    records
  })
  girdInstances.push(grid)
  return grid
}
