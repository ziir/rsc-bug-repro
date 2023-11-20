# RSC Bug Repro

- npm ci
- npm run build
- new tab: npm start
- http://localhost:3000

See in the server logs (incorrect):

```
Shell Ready!
ClientConsumer before the use()
ClientConsumer after the use() {
  '$$typeof': Symbol(react.element),
  type: Symbol(react.suspense),
  key: null,
  ref: null,
  props: {
    fallback: 'loading ...',
    children: {
      '$$typeof': Symbol(react.element),
      type: [Object],
      key: null,
      ref: null,
      props: [Object],
      _owner: null,
      _store: {}
    }
  },
  _owner: null,
  _store: {}
}
All Ready!
```

While in the browser console (correct):

```
1:"$Sreact.suspense"
2:I["./src/app/client-consumer.js",["client0","client0.chunk.js"],"ClientConsumer"]
0:["$","$1",null,{"fallback":"loading ...","children":["$","$L2",null,{"promise":"$@3"}]}]
3:["foo","bar"]
[client] hydrating root
ClientConsumer before the use() (2)
ClientConsumer after the use() Array [ "foo", "bar" ]
```

And on second SSR load, in the server logs (correct, expected):

```
ClientConsumer before the use()
Shell Ready!
ClientConsumer before the use()
ClientConsumer after the use() [ 'foo', 'bar' ]
All Ready!
```
