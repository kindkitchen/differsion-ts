- The `json_to_path_value_dict` util, though little wild - is looked pretty
  perspective
- Next step - somehow store inputs globally and track some declared values by
  path

---

#### Example:

```ts
const user_from_leader_api_res = {
    id: 123,
    name: "Mr. Example",
};

const hist_post = {
    title: "Best ever joke",
    content: "Almost always one of the shoes is not right",
    author_id: 123, /// SO THIS IS user.id
};
```

The goal is store and observe the relation. `user.id` => `post.author_id`

# Why?

So another server obviously will have different ids (values) but we will still
compare it's responses with original by this contract.
