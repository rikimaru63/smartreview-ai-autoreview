{ pkgs }: {
  deps = [
    pkgs.python311Full
    pkgs.python311Packages.pip
    pkgs.nodejs_18
    pkgs.nodePackages.npm
    pkgs.nodePackages.typescript
    pkgs.nodePackages.vite
  ];
  env = {
    PYTHON_LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.stdenv.cc.cc.lib
    ];
  };
}