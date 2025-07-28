# Git Submodules Guide

## Adding grammar-ops as a submodule

Once you have the grammar-ops repository URL, run:

```bash
# Add the submodule
git submodule add https://github.com/[username]/grammar-ops.git grammar-ops

# Commit the submodule addition
git add .gitmodules grammar-ops
git commit -m "Add grammar-ops as submodule"
```

## Benefits of using submodules

1. **Separate version control** - grammar-ops maintains its own git history
2. **Easy updates** - Pull latest grammar-ops changes independently
3. **Clean separation** - Clear boundary between your app and the framework
4. **Reusability** - Same grammar-ops can be used in multiple projects

## Working with submodules

### Cloning a project with submodules
```bash
# Clone with submodules
git clone --recursive https://github.com/prompt-stack/endowment-calculator.git

# Or if already cloned
git submodule init
git submodule update
```

### Updating grammar-ops
```bash
cd grammar-ops
git pull origin main
cd ..
git add grammar-ops
git commit -m "Update grammar-ops submodule"
```

### Important for deployment
- Railway and Vercel will automatically handle submodules
- The `.gitmodules` file tracks the submodule configuration