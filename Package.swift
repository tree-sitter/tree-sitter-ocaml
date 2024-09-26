// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterOCaml",
    products: [
        .library(name: "TreeSitterOCaml", targets: ["TreeSitterOCaml"]),
    ],
  dependencies: [
    .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
  ],
  targets: [
    .target(
      name: "TreeSitterOCaml",
      path: ".",
      sources: [
        "grammars/ocaml/src/parser.c",
        "grammars/ocaml/src/scanner.c",
        "grammars/interface/src/parser.c",
        "grammars/interface/src/scanner.c",
        "grammars/type/src/parser.c",
        "grammars/type/src/scanner.c",
      ],
      resources: [
        .copy("queries")
      ],
      publicHeadersPath: "bindings/swift",
      cSettings: [.headerSearchPath("grammars/ocaml/src")]
    ),
    .testTarget(
      name: "TreeSitterOCamlTests",
      dependencies: [
        "SwiftTreeSitter",
        "TreeSitterOCaml",
      ],
      path: "bindings/swift/TreeSitterOCamlTests"
    )
  ],
  cLanguageStandard: .c11
)
