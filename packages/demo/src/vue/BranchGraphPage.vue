<template>
  <div class="home">
    <div class="page-title">
      <h1>Branch Graph on the Grid!!</h1>
      <span>Canvas-based Grid so you can draw branch graphs.</span>
    </div>
    <br>
    <div
      class="grid"
    >
      <c-grid
        ref="grid"
        :data="data"
      >
        <c-grid-branch-graph-column
          :width="200"
          cache
          field="command"
        >
          Graph
        </c-grid-branch-graph-column>
        <c-grid-input-column
          field="user"
          width="120"
        >
          User
        </c-grid-input-column>
        <c-grid-input-column
          field="comment"
          width="calc(100% - 320px - 20px)"
          min-width="200"
        >
          Comment
        </c-grid-input-column>
      </c-grid>
    </div>
  </div>
</template>
<script>

const records = [

  {
    command: [{ command: 'commit', branch: 'main' }, { command: 'tag', branch: 'main', tag: 'v1.1.0' }],
    comment: 'release 1.1.0',
    user: 'user1'
  },
  {
    command: [{ command: 'commit', branch: 'develop2' }],
    comment: 'Update A for B',
    user: 'user2'
  },
  {
    command: [{ command: 'merge', branch: { from: 'main', to: 'develop2' } }],
    comment: 'merge',
    user: 'user2'
  },
  {
    command: [{ command: 'merge', branch: { from: 'develop3', to: 'main' } }],
    comment: 'merge',
    user: 'user1'
  },
  {
    command: [{ command: 'commit', branch: 'develop2' }],
    comment: 'Fix for A',
    user: 'user2'
  },
  {
    command: [{ command: 'branch', branch: { from: 'main', to: 'develop3' } }, { command: 'commit', branch: 'develop3' }],
    comment: 'Fix A to B',
    user: 'user3'
  },
  {
    command: [{ command: 'branch', branch: { from: 'main', to: 'develop2' } }],
    comment: 'fork user2',
    user: 'user2'
  },
  {
    command: [{ command: 'merge', branch: { from: 'develop', to: 'main' } }],
    comment: 'merge',
    user: 'user2'
  },
  {
    command: [{ command: 'commit', branch: 'develop' }],
    comment: 'Add A for B',
    user: 'user2'
  },
  {
    command: [{ command: 'commit', branch: 'main' }, { command: 'tag', branch: 'main', tag: 'v1.0.0' }, { command: 'branch', branch: { from: 'main', to: 'develop' } }],
    comment: 'release 1.0.0',
    user: 'user1'
  },
  {
    command: [{ command: 'branch', branch: 'main' }, { command: 'commit', branch: 'main' }],
    comment: 'initial commit',
    user: 'user1'
  }
]

export default {
  name: 'BranchGraph',
  data () {
    return { data: records }
  }
}
</script>

<style scoped>
</style>
