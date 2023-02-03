// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterOCaml",
    platforms: [.macOS(.v10_13), .iOS(.v11)],
    products: [
        .library(name: "TreeSitterOCaml", targets: ["TreeSitterOCaml"]),
    ],
    dependencies: [],
    targets: [
        .target(name: "TreeSitterOCaml",
                path: ".",
                exclude: [
                    "binding.gyp",
                    "bindings",
                    "Cargo.toml",
                    "ocaml/corpus",
                    "interface/corpus",
                    "examples",
                    "ocaml/grammar.js",
                    "interface/grammar.js",
                    "LICENSE",
                    "ocaml/package.json",
                    "interface/package.json",
                    "package.json",
                    "README.md",
                    "queries/locals.scm"
                ],
                sources: [
                    "ocaml/src/parser.c",
                    "ocaml/src/scanner.cc",
                    "interface/src/parser.c",
                    "interface/src/scanner.cc",
                ],
                resources: [
                    .copy("queries")
                ],
                publicHeadersPath: "bindings/swift",
                cSettings: [.headerSearchPath("src")])
    ]
)
