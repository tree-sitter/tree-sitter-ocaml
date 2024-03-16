// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterOCaml",
    platforms: [.macOS(.v10_13), .iOS(.v11)],
    products: [
        .library(name: "TreeSitterOCaml", targets: ["TreeSitterOCaml"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.7.1"),
    ],
    targets: [
        .target(
            name: "TreeSitterOCaml",
            path: ".",
            sources: [
                "grammars/interface/src/parser.c",
                "grammars/interface/src/scanner.c",
                "grammars/ocaml/src/parser.c",
                "grammars/ocaml/src/scanner.c",
                "include",
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("include")]
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
